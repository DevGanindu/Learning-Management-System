import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Create monthly payments for ALL approved students who don't have payment records yet
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { month, year } = body;

        if (!month || !year) {
            return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
        }

        // Find all approved students who don't have a payment record for this month/year
        // Include their grade to get the grade-specific fee
        const approvedStudents = await prisma.student.findMany({
            where: {
                approvalStatus: "APPROVED",
                payments: {
                    none: {
                        month: month,
                        year: year,
                    },
                },
            },
            select: {
                id: true,
                grade: {
                    select: { monthlyFee: true }
                }
            },
        });

        if (approvedStudents.length === 0) {
            return NextResponse.json({
                message: "All approved students already have payment records for this month",
                created: 0
            });
        }

        // Create payment records for all these students with their grade-specific fees
        const dueDate = new Date(year, month - 1, 15); // Due on 15th of the month

        let createdCount = 0;
        for (const student of approvedStudents) {
            await prisma.payment.create({
                data: {
                    studentId: student.id,
                    amount: student.grade.monthlyFee,
                    month: month,
                    year: year,
                    dueDate: dueDate,
                    status: "UNPAID",
                },
            });
            createdCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Created ${createdCount} payment records with grade-specific fees`,
            created: createdCount,
        });
    } catch (error) {
        console.error("Error creating batch payments:", error);
        return NextResponse.json({ error: "Failed to create payments" }, { status: 500 });
    }
}
