import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getGracePeriodExpiryDate } from "@/lib/utils";

// GET: Fetch pending registrations
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "PENDING";

        const registrations = await prisma.student.findMany({
            where: { approvalStatus: status },
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
                        name: true,
                    },
                },
            },
            orderBy: { enrollmentDate: "desc" },
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }
}

// PATCH: Approve or reject registration
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { studentId, action } = body;

        if (!studentId || !action || !["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const updateData: any = {
            approvalStatus: action,
            approvedAt: new Date(),
            approvedBy: session.user.id,
        };

        // If approved, also activate the student account
        if (action === "APPROVED") {
            updateData.isActive = true;
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: updateData,
            include: {
                user: { select: { name: true } },
                grade: { select: { monthlyFee: true } },
            },
        });

        // If approved, create payment record for the current month
        if (action === "APPROVED") {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const dueDate = getGracePeriodExpiryDate(currentYear, currentMonth);

            // Check if payment record already exists (to avoid duplicates)
            const existingPayment = await prisma.payment.findUnique({
                where: {
                    studentId_month_year: {
                        studentId: studentId,
                        month: currentMonth,
                        year: currentYear,
                    },
                },
            });

            if (!existingPayment) {
                // Use grade-specific monthly fee
                const feeAmount = student.grade.monthlyFee;

                await prisma.payment.create({
                    data: {
                        studentId: studentId,
                        amount: feeAmount,
                        month: currentMonth,
                        year: currentYear,
                        status: "UNPAID",
                        dueDate: dueDate,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Student ${student.user.name} has been ${action.toLowerCase()}.`,
        });
    } catch (error) {
        console.error("Error updating registration:", error);
        return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
    }
}
