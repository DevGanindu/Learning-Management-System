/**
 * NextAuth.js Full Configuration (Server-side only)
 * 
 * This file contains the full auth setup with Prisma and bcrypt.
 * Only imported in server components and API routes - NOT in middleware.
 */

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Student ID or Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // Validate input
                    const validatedData = loginSchema.parse(credentials);
                    const { identifier, password } = validatedData;

                    let user = null;

                    // Check if identifier looks like a Student ID (starts with STU-)
                    if (identifier.toUpperCase().startsWith("STU-")) {
                        // Find student by studentId
                        const student = await prisma.student.findUnique({
                            where: { studentId: identifier.toUpperCase() },
                            include: {
                                user: true,
                                grade: true,
                            },
                        });

                        if (!student) {
                            return null;
                        }

                        // Check approval status
                        if (student.approvalStatus === "PENDING") {
                            throw new Error("Your account is pending approval. Please wait for admin approval.");
                        }
                        if (student.approvalStatus === "REJECTED") {
                            throw new Error("Your registration was rejected. Please contact administrator.");
                        }

                        // Check if account is locked
                        if (!student.isActive || student.lockedDueToPayment) {
                            throw new Error("Account is locked. Please contact administrator.");
                        }

                        // Verify password
                        const isValidPassword = await bcrypt.compare(password, student.user.password);
                        if (!isValidPassword) {
                            return null;
                        }

                        // Return user data
                        return {
                            id: student.user.id,
                            email: student.user.email,
                            name: student.user.name,
                            role: student.user.role,
                            studentId: student.id,
                            gradeId: student.gradeId,
                        };
                    } else {
                        // Find user by email (for admin/teacher)
                        user = await prisma.user.findUnique({
                            where: { email: identifier.toLowerCase() },
                            include: {
                                student: {
                                    include: {
                                        grade: true
                                    }
                                }
                            }
                        });

                        if (!user) {
                            return null;
                        }

                        // Verify password
                        const isValidPassword = await bcrypt.compare(password, user.password);
                        if (!isValidPassword) {
                            return null;
                        }

                        // If user is a student, check approval and lock status
                        if (user.student) {
                            if (user.student.approvalStatus === "PENDING") {
                                throw new Error("Your account is pending approval.");
                            }
                            if (user.student.approvalStatus === "REJECTED") {
                                throw new Error("Your registration was rejected.");
                            }
                            if (!user.student.isActive || user.student.lockedDueToPayment) {
                                throw new Error("Account is locked. Please contact administrator.");
                            }
                        }

                        // Return user data
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            studentId: user.student?.id,
                            gradeId: user.student?.gradeId,
                        };
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    if (error instanceof Error) {
                        throw error; // Re-throw to show message to user
                    }
                    return null;
                }
            }
        })
    ],
});
