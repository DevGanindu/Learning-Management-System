import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const createClassSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    platform: z.enum(["ZOOM", "TEAMS", "MEET", "OTHER"]),
    link: z.string().url(),
    gradeId: z.string(),
    scheduledAt: z.string().datetime().optional(),
});

const updateClassSchema = createClassSchema.partial().extend({
    id: z.string(),
});

// GET - Fetch online classes
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const gradeId = searchParams.get("gradeId");
        const teacherOnly = searchParams.get("teacherOnly") === "true";

        const where: any = { type: "ONLINE_CLASS" };

        if (gradeId) where.gradeId = gradeId;

        // If teacher, show only their classes
        if (session.user.role === "TEACHER" && teacherOnly) {
            where.uploadedById = session.user.id;
        }

        // If student, show only their grade's classes
        if (session.user.role === "STUDENT" && session.user.gradeId) {
            where.gradeId = session.user.gradeId;
        }

        const classes = await prisma.material.findMany({
            where,
            include: {
                grade: { select: { name: true, level: true } },
                uploader: { select: { name: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });

        return NextResponse.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}

// POST - Create new online class
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createClassSchema.parse(body);

        // Store platform info in description for now (simple approach)
        const descriptionWithPlatform = validatedData.description
            ? `[${validatedData.platform}] ${validatedData.description}`
            : `[${validatedData.platform}]`;

        const classLink = await prisma.material.create({
            data: {
                title: validatedData.title,
                description: descriptionWithPlatform,
                type: "ONLINE_CLASS",
                gradeId: validatedData.gradeId,
                link: validatedData.link,
                uploadedById: session.user.id,
            },
            include: {
                grade: { select: { name: true } },
            },
        });

        return NextResponse.json(classLink, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating class:", error);
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }
}

// PUT - Update class
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateClassSchema.parse(body);

        const existingClass = await prisma.material.findUnique({
            where: { id: validatedData.id },
        });

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        if (session.user.role === "TEACHER" && existingClass.uploadedById !== session.user.id) {
            return NextResponse.json({ error: "You can only edit your own classes" }, { status: 403 });
        }

        const descriptionWithPlatform = validatedData.platform
            ? validatedData.description
                ? `[${validatedData.platform}] ${validatedData.description}`
                : `[${validatedData.platform}]`
            : validatedData.description;

        const updatedClass = await prisma.material.update({
            where: { id: validatedData.id },
            data: {
                title: validatedData.title,
                description: descriptionWithPlatform,
                gradeId: validatedData.gradeId,
                link: validatedData.link,
            },
        });

        return NextResponse.json(updatedClass);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error updating class:", error);
        return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
    }
}

// DELETE - Remove class
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Class ID required" }, { status: 400 });
        }

        const classLink = await prisma.material.findUnique({
            where: { id },
        });

        if (!classLink) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        if (session.user.role === "TEACHER" && classLink.uploadedById !== session.user.id) {
            return NextResponse.json({ error: "You can only delete your own classes" }, { status: 403 });
        }

        await prisma.material.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting class:", error);
        return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
    }
}
