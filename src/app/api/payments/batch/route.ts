import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Create monthly payments for ALL approved students who don't have payment records yet
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { month, year, amount } = body;

        if (!month || !year || !amount) {
            return NextResponse.json({ error: "Month, year, and amount are required" }, { status: 400 });
        }

        // Find all approved students who don't have a payment record for this month/year
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
            select: { id: true },
        });

        if (approvedStudents.length === 0) {
            return NextResponse.json({
                message: "All approved students already have payment records for this month",
                created: 0
            });
        }

        // Create payment records for all these students
        const dueDate = new Date(year, month - 1, 15); // Due on 15th of the month

        const payments = await prisma.payment.createMany({
            data: approvedStudents.map(student => ({
                studentId: student.id,
                amount: amount,
                month: month,
                year: year,
                dueDate: dueDate,
                status: "UNPAID",
            })),
        });

        return NextResponse.json({
            success: true,
            message: `Created ${payments.count} payment records`,
            created: payments.count,
        });
    } catch (error) {
        console.error("Error creating batch payments:", error);
        return NextResponse.json({ error: "Failed to create payments" }, { status: 500 });
    }
}
