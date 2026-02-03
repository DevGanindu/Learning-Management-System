import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadDocument, StorageError } from "@/lib/storage";

// Force Node.js runtime - required for Supabase storage operations
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Upload to Supabase Storage using the storage utility
        // Files are stored in the 'materials' folder within the 'documents' bucket
        const result = await uploadDocument(file, "materials");

        return NextResponse.json({
            success: true,
            fileUrl: result.publicUrl,
            filePath: result.filePath,
            filename: result.filename,
            size: result.size,
        });
    } catch (error) {
        console.error("Error uploading file:", error);

        // Handle specific storage errors
        if (error instanceof StorageError) {
            const statusMap: Record<StorageError['code'], number> = {
                'FILE_TOO_LARGE': 413,
                'INVALID_FILE_TYPE': 415,
                'UPLOAD_FAILED': 500,
                'DELETE_FAILED': 500,
                'NOT_FOUND': 404,
            };

            return NextResponse.json(
                { error: error.message },
                { status: statusMap[error.code] || 500 }
            );
        }

        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
