import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendRegistrationEmail } from "@/lib/email";

// Validation schema
const registerSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email address required"),
    birthday: z.string().min(1, "Date of birth is required"),
    address: z.string().min(5, "Address is required"),
    phone: z.string().min(10, "Valid phone number required"),
    parentName: z.string().min(2, "Parent name is required"),
    parentPhone: z.string().optional(),
    gradeId: z.string().min(1, "Please select a grade"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Generate unique Student ID
async function generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}`;

    // Find the last student ID for this year
    const lastStudent = await prisma.student.findFirst({
        where: { studentId: { startsWith: prefix } },
        orderBy: { studentId: "desc" },
        select: { studentId: true },
    });

    let sequence = 1;
    if (lastStudent) {
        const lastSequence = parseInt(lastStudent.studentId.split("-")[2]);
        sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(5, "0")}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { fullName, email, birthday, address, phone, parentName, parentPhone, gradeId, password } = validation.data;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "This email is already registered" },
                { status: 400 }
            );
        }

        // Check if grade exists
        const grade = await prisma.grade.findUnique({
            where: { id: gradeId },
        });

        if (!grade) {
            return NextResponse.json(
                { error: "Invalid grade selected" },
                { status: 400 }
            );
        }

        // Generate unique student ID
        const studentId = await generateStudentId();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and student in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user with the provided email
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    name: fullName,
                    phone,
                    role: "STUDENT",
                },
            });

            // Create student profile with birthday
            const student = await tx.student.create({
                data: {
                    studentId,
                    userId: user.id,
                    gradeId,
                    birthday: new Date(birthday),
                    address,
                    parentName,
                    parentPhone: parentPhone || null,
                    approvalStatus: "PENDING",
                    isActive: false, // Not active until approved
                },
            });

            return { user, student };
        });

        // Send registration email
        await sendRegistrationEmail(email, studentId, fullName);

        return NextResponse.json({
            success: true,
            studentId,
            message: "Registration successful! Please check your email for your Student ID.",
        });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed. Please try again." },
            { status: 500 }
        );
    }
}
