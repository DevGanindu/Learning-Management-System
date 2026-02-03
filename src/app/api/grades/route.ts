import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch all grades (public endpoint for registration)
export async function GET() {
    try {
        const grades = await prisma.grade.findMany({
            orderBy: { level: "asc" },
            select: {
                id: true,
                name: true,
                level: true,
                monthlyFee: true,
            },
        });

        return NextResponse.json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
    }
}

// PATCH - Update grade fee (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { gradeId, monthlyFee } = body;

        if (!gradeId || monthlyFee === undefined || monthlyFee < 0) {
            return NextResponse.json({ error: "Invalid request. Grade ID and valid fee required." }, { status: 400 });
        }

        const newFee = parseFloat(monthlyFee);

        // Update the grade fee
        const updatedGrade = await prisma.grade.update({
            where: { id: gradeId },
            data: { monthlyFee: newFee },
        });

        // Also update all UNPAID payments for students in this grade
        const updateResult = await prisma.payment.updateMany({
            where: {
                status: "UNPAID",
                student: {
                    gradeId: gradeId,
                },
            },
            data: {
                amount: newFee,
            },
        });

        return NextResponse.json({
            success: true,
            message: `${updatedGrade.name} fee updated to Rs. ${updatedGrade.monthlyFee}. ${updateResult.count} unpaid payment(s) updated.`,
            grade: updatedGrade,
            paymentsUpdated: updateResult.count,
        });
    } catch (error) {
        console.error("Error updating grade fee:", error);
        return NextResponse.json({ error: "Failed to update grade fee" }, { status: 500 });
    }
}
