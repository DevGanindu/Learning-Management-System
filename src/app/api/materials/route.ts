import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { z } from "zod";

// Validation schema
const createMaterialSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    type: z.enum(["PDF", "DOC", "YOUTUBE", "ONLINE_CLASS"]),
    gradeId: z.string(),
    fileUrl: z.string().optional(),
    link: z.string().url().optional(),
});

const updateMaterialSchema = createMaterialSchema.partial().extend({
    id: z.string(),
});

// GET - Fetch materials with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const gradeId = searchParams.get("gradeId");
        const type = searchParams.get("type");
        const teacherOnly = searchParams.get("teacherOnly") === "true";

        const where: any = {};

        if (gradeId) where.gradeId = gradeId;
        if (type) where.type = type;

        // If teacher, show only their materials
        if (session.user.role === "TEACHER" && teacherOnly) {
            where.uploadedById = session.user.id;
        }

        // If student, show only their grade's materials
        if (session.user.role === "STUDENT" && session.user.gradeId) {
            where.gradeId = session.user.gradeId;
        }

        const materials = await prisma.material.findMany({
            where,
            include: {
                grade: { select: { name: true, level: true } },
                uploader: { select: { name: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error("Error fetching materials:", error);
        return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
    }
}

// POST - Create new material
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createMaterialSchema.parse(body);

        const material = await prisma.material.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                type: validatedData.type,
                gradeId: validatedData.gradeId,
                fileUrl: validatedData.fileUrl,
                link: validatedData.link,
                uploadedById: session.user.id,
            },
            include: {
                grade: { select: { name: true } },
            },
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating material:", error);
        return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
    }
}

// PUT - Update material
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateMaterialSchema.parse(body);

        // Check ownership (teachers can only edit their own materials)
        const existingMaterial = await prisma.material.findUnique({
            where: { id: validatedData.id },
        });

        if (!existingMaterial) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        if (session.user.role === "TEACHER" && existingMaterial.uploadedById !== session.user.id) {
            return NextResponse.json({ error: "You can only edit your own materials" }, { status: 403 });
        }

        const material = await prisma.material.update({
            where: { id: validatedData.id },
            data: {
                title: validatedData.title,
                description: validatedData.description,
                type: validatedData.type,
                gradeId: validatedData.gradeId,
                fileUrl: validatedData.fileUrl,
                link: validatedData.link,
            },
        });

        return NextResponse.json(material);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error updating material:", error);
        return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
    }
}

// DELETE - Remove material
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Material ID required" }, { status: 400 });
        }

        const material = await prisma.material.findUnique({
            where: { id },
        });

        if (!material) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        // Check ownership
        if (session.user.role === "TEACHER" && material.uploadedById !== session.user.id) {
            return NextResponse.json({ error: "You can only delete your own materials" }, { status: 403 });
        }

        // Delete file if exists
        if (material.fileUrl) {
            try {
                const filePath = path.join(process.cwd(), "public", material.fileUrl);
                await unlink(filePath);
            } catch (err) {
                console.log("File already deleted or not found");
            }
        }

        await prisma.material.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
    }
}
