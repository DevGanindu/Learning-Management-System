import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Fetch pending registrations
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
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
        if (!session?.user || session.user.role !== "ADMIN") {
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
            },
        });

        return NextResponse.json({
            success: true,
            message: `Student ${student.user.name} has been ${action.toLowerCase()}.`,
        });
    } catch (error) {
        console.error("Error updating registration:", error);
        return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
    }
}
