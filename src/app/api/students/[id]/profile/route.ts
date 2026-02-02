import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch student profile with bio data
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = params.id;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                    },
                },
                grade: {
                    select: {
                        id: true,
                        name: true,
                        level: true,
                    },
                },
                payments: {
                    orderBy: [{ year: "desc" }, { month: "desc" }],
                    take: 6,
                    select: {
                        id: true,
                        month: true,
                        year: true,
                        amount: true,
                        status: true,
                        paidDate: true,
                    },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
    }
}
