import prisma from "./prisma";

/**
 * Check if a student has paid for the current month
 */
export async function checkPaymentStatus(studentId: string): Promise<boolean> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const payment = await prisma.payment.findUnique({
        where: {
            studentId_month_year: {
                studentId,
                month: currentMonth,
                year: currentYear,
            },
        },
    });

    return payment?.status === "PAID";
}

/**
 * Check if a student's account is locked due to non-payment
 */
export async function isAccountLocked(studentId: string): Promise<boolean> {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { lockedDueToPayment: true, isActive: true },
    });

    return student?.lockedDueToPayment || !student?.isActive;
}

/**
 * Lock a student account due to non-payment
 */
export async function lockStudentForNonPayment(studentId: string): Promise<void> {
    await prisma.student.update({
        where: { id: studentId },
        data: { lockedDueToPayment: true },
    });
}

/**
 * Unlock a student account after payment
 */
export async function unlockStudentAccount(studentId: string): Promise<void> {
    await prisma.student.update({
        where: { id: studentId },
        data: { lockedDueToPayment: false },
    });
}

/**
 * Check and update all students for payment overdue
 * This should be run periodically (e.g., via cron job)
 */
export async function checkAndLockOverdueStudents(): Promise<{ locked: number; unlocked: number }> {
    const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || "14");
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Find all unpaid payments for current month that are past grace period
    const overduePayments = await prisma.payment.findMany({
        where: {
            month: currentMonth,
            year: currentYear,
            status: "UNPAID",
            dueDate: {
                lt: new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000),
            },
        },
        include: {
            student: true,
        },
    });

    let locked = 0;
    let unlocked = 0;

    // Lock overdue students
    for (const payment of overduePayments) {
        if (!payment.student.lockedDueToPayment) {
            await lockStudentForNonPayment(payment.studentId);
            locked++;
        }
    }

    // Find paid students who are still locked (shouldn't be)
    const paidPayments = await prisma.payment.findMany({
        where: {
            month: currentMonth,
            year: currentYear,
            status: "PAID",
            student: {
                lockedDueToPayment: true,
            },
        },
        include: {
            student: true,
        },
    });

    // Unlock paid students
    for (const payment of paidPayments) {
        if (payment.student.lockedDueToPayment) {
            await unlockStudentAccount(payment.studentId);
            unlocked++;
        }
    }

    return { locked, unlocked };
}

/**
 * Validate that a user can access content for a specific grade
 */
export async function validateGradeAccess(userId: string, gradeId: string): Promise<boolean> {
    // Find the student
    const student = await prisma.student.findFirst({
        where: { userId },
        select: { gradeId: true, lockedDueToPayment: true, isActive: true },
    });

    if (!student) return false;

    // Check if account is active
    if (student.lockedDueToPayment || !student.isActive) return false;

    // Check grade match
    return student.gradeId === gradeId;
}

/**
 * Get student with full access status
 */
export async function getStudentAccessStatus(userId: string): Promise<{
    hasAccess: boolean;
    isPaid: boolean;
    isLocked: boolean;
    gradeName: string | null;
} | null> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const student = await prisma.student.findFirst({
        where: { userId },
        include: {
            grade: { select: { name: true } },
            payments: {
                where: {
                    month: currentMonth,
                    year: currentYear,
                },
                take: 1,
            },
        },
    });

    if (!student) return null;

    const isPaid = student.payments[0]?.status === "PAID";
    const isLocked = student.lockedDueToPayment;

    return {
        hasAccess: isPaid && !isLocked,
        isPaid,
        isLocked,
        gradeName: student.grade.name,
    };
}
