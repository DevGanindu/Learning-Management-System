import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadDocument, StorageError } from "@/lib/storage";
import prisma from "@/lib/prisma";

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json(
                { error: "Image too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${session.user.id}_${timestamp}.${ext}`;

        // Upload to Supabase Storage
        const { supabaseAdmin } = await import("@/lib/supabase");

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabaseAdmin.storage
            .from("documents")
            .upload(`profiles/${filename}`, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error("Profile upload error:", error);
            return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
        }

        // Get public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/profiles/${filename}`;

        // Update user profile in database
        await prisma.user.update({
            where: { id: session.user.id },
            data: { profileImage: publicUrl },
        });

        return NextResponse.json({
            success: true,
            imageUrl: publicUrl,
        });
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Remove profile image from database
        await prisma.user.update({
            where: { id: session.user.id },
            data: { profileImage: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing profile image:", error);
        return NextResponse.json({ error: "Failed to remove image" }, { status: 500 });
    }
}
