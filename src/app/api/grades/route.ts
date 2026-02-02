import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all grades (public endpoint for registration)
export async function GET() {
    try {
        const grades = await prisma.grade.findMany({
            orderBy: { level: "asc" },
            select: {
                id: true,
                name: true,
                level: true,
            },
        });

        return NextResponse.json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
    }
}
