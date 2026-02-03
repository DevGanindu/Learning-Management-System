import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch student data
        const student = await prisma.student.findFirst({
            where: { userId: session.user.id },
            include: {
                grade: true,
                payments: {
                    where: {
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1,
                    },
                    take: 1,
                },
            },
        });

        // Fetch user data with profile image
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                profileImage: true,
            },
        });

        // Get materials count for this grade
        const materialsCount = await prisma.material.count({
            where: { gradeId: student?.gradeId },
        });

        // Get online classes count for this grade
        const classesCount = await prisma.material.count({
            where: { 
                gradeId: student?.gradeId,
                type: "ONLINE_CLASS"
            },
        });

        return NextResponse.json({
            student,
            user,
            materialsCount,
            classesCount,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
    }
}
