import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        // Create grades if they don't exist
        const gradesData = [
            { level: 6, name: "Grade 6" },
            { level: 7, name: "Grade 7" },
            { level: 8, name: "Grade 8" },
            { level: 9, name: "Grade 9" },
            { level: 10, name: "Grade 10" },
            { level: 11, name: "Grade 11" },
        ];

        for (const grade of gradesData) {
            await prisma.grade.upsert({
                where: { level: grade.level },
                update: {},
                create: grade,
            });
        }

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: "admin@lms.com" },
        });

        if (existingAdmin) {
            return NextResponse.json({
                message: "Database already seeded",
                credentials: {
                    admin: { email: "admin@lms.com", password: "admin123" },
                    teacher: { email: "teacher@lms.com", password: "teacher123" },
                }
            });
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash("admin123", 10);

        await prisma.user.create({
            data: {
                email: "admin@lms.com",
                password: hashedPassword,
                name: "Admin User",
                role: "ADMIN",
            },
        });

        // Create teacher
        await prisma.user.create({
            data: {
                email: "teacher@lms.com",
                password: await bcrypt.hash("teacher123", 10),
                name: "Teacher User",
                role: "TEACHER",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully with grades, admin and teacher",
            credentials: {
                admin: { email: "admin@lms.com", password: "admin123" },
                teacher: { email: "teacher@lms.com", password: "teacher123" },
            }
        });
    } catch (error) {
        console.error("Error seeding database:", error);
        return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
    }
}

