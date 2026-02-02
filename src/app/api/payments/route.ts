import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const createPaymentSchema = z.object({
    studentId: z.string(),
    amount: z.number().positive(),
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100),
    dueDate: z.string().datetime().optional(),
});

const updatePaymentSchema = z.object({
    paymentId: z.string(),
    status: z.enum(["PAID", "UNPAID"]),
});

// GET - Fetch payments with optional filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const gradeId = searchParams.get("gradeId");
        const studentId = searchParams.get("studentId");

        const where: any = {};

        if (month) where.month = parseInt(month);
        if (year) where.year = parseInt(year);
        if (studentId) where.studentId = studentId;
        if (gradeId) {
            where.student = { gradeId };
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        grade: { select: { name: true, level: true } },
                    },
                },
            },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

// POST - Create new payment record
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createPaymentSchema.parse(body);

        // Check if payment already exists for this student/month/year
        const existingPayment = await prisma.payment.findUnique({
            where: {
                studentId_month_year: {
                    studentId: validatedData.studentId,
                    month: validatedData.month,
                    year: validatedData.year,
                },
            },
        });

        if (existingPayment) {
            return NextResponse.json(
                { error: "Payment record already exists for this month" },
                { status: 400 }
            );
        }

        // Create default due date if not provided (15th of the month)
        const dueDate = validatedData.dueDate
            ? new Date(validatedData.dueDate)
            : new Date(validatedData.year, validatedData.month - 1, 15);

        const payment = await prisma.payment.create({
            data: {
                studentId: validatedData.studentId,
                amount: validatedData.amount,
                month: validatedData.month,
                year: validatedData.year,
                dueDate,
                status: "UNPAID",
            },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error creating payment:", error);
        return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }
}

// PATCH - Update payment status (mark paid/unpaid)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updatePaymentSchema.parse(body);

        const payment = await prisma.payment.update({
            where: { id: validatedData.paymentId },
            data: {
                status: validatedData.status,
                paidDate: validatedData.status === "PAID" ? new Date() : null,
            },
            include: {
                student: true,
            },
        });

        // If marking as PAID, unlock the student account
        if (validatedData.status === "PAID" && payment.student.lockedDueToPayment) {
            await prisma.student.update({
                where: { id: payment.studentId },
                data: { lockedDueToPayment: false },
            });
        }

        // If marking as UNPAID, check if we should lock the account
        if (validatedData.status === "UNPAID") {
            const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || "14");
            const dueDate = new Date(payment.dueDate);
            const now = new Date();
            const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysPastDue > gracePeriodDays) {
                await prisma.student.update({
                    where: { id: payment.studentId },
                    data: { lockedDueToPayment: true },
                });
            }
        }

        return NextResponse.json(payment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Error updating payment:", error);
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }
}
