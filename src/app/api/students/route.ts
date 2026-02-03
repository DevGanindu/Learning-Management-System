import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all approved students with related data
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeAll = searchParams.get("includeAll") === "true";

        // By default, only include approved students
        const whereClause = includeAll ? {} : { approvalStatus: "APPROVED" };

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                grade: { select: { id: true, name: true, level: true } },
                payments: {
                    where: {
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1,
                    },
                    take: 1,
                    select: { status: true },
                },
            },
            orderBy: [
                { grade: { level: "asc" } },
                { enrollmentDate: "desc" },
            ],
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}
