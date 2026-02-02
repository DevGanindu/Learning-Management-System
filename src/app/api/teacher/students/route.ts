import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all approved students for teacher view
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const students = await prisma.student.findMany({
            where: {
                approvalStatus: "APPROVED",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                grade: {
                    select: {
                        id: true,
                        name: true,
                        level: true,
                    },
                },
            },
            orderBy: [
                { grade: { level: "asc" } },
                { user: { name: "asc" } },
            ],
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}
