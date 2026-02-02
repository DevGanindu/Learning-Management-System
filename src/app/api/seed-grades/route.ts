import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Seed grades (for development only, accessible from browser)
export async function GET() {
    try {
        const grades = [];
        for (let level = 6; level <= 11; level++) {
            const grade = await prisma.grade.upsert({
                where: { level },
                update: {},
                create: { level, name: `Grade ${level}` },
            });
            grades.push(grade);
        }

        return NextResponse.json({
            message: "Grades seeded successfully",
            grades
        });
    } catch (error) {
        console.error("Error seeding grades:", error);
        return NextResponse.json({ error: "Failed to seed grades" }, { status: 500 });
    }
}

// POST - Seed grades (for development only)
export async function POST() {
    try {
        const grades = [];
        for (let level = 6; level <= 11; level++) {
            const grade = await prisma.grade.upsert({
                where: { level },
                update: {},
                create: { level, name: `Grade ${level}` },
            });
            grades.push(grade);
        }

        return NextResponse.json({
            message: "Grades seeded successfully",
            grades
        });
    } catch (error) {
        console.error("Error seeding grades:", error);
        return NextResponse.json({ error: "Failed to seed grades" }, { status: 500 });
    }
}
