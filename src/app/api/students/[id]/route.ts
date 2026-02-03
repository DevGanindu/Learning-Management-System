import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE - Delete a student and their user account
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: studentId } = await params;

        // Find the student to get the userId
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { userId: true },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Delete the user (this will cascade delete the student due to onDelete: Cascade)
        await prisma.user.delete({
            where: { id: student.userId },
        });

        return NextResponse.json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}
