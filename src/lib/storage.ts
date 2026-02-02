import { supabaseAdmin, getSupabaseUrl } from './supabase';

// Storage bucket name
const BUCKET_NAME = 'documents';

// Allowed MIME types for documents
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
};

// Max file size in bytes (default 10MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;

// Error types for better error handling
export class StorageError extends Error {
    constructor(
        message: string,
        public code: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'UPLOAD_FAILED' | 'DELETE_FAILED' | 'NOT_FOUND'
    ) {
        super(message);
        this.name = 'StorageError';
    }
}

// Validation result type
interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate file type against allowed MIME types
 */
function validateFileType(mimeType: string, filename: string): ValidationResult {
    const allowedExtensions = ALLOWED_MIME_TYPES[mimeType];

    if (!allowedExtensions) {
        return {
            valid: false,
            error: `Invalid file type: ${mimeType}. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT`,
        };
    }

    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
        return {
            valid: false,
            error: `File extension ${ext} doesn't match MIME type ${mimeType}`,
        };
    }

    return { valid: true };
}

/**
 * Validate file size against maximum allowed
 */
function validateFileSize(size: number): ValidationResult {
    if (size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(size / 1024 / 1024).toFixed(2)}MB`,
        };
    }
    return { valid: true };
}

/**
 * Generate a unique filename using timestamp and sanitized original name
 */
function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedName = originalName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_');

    return `${timestamp}_${randomSuffix}_${sanitizedName}`;
}

/**
 * Upload a document to Supabase Storage
 * 
 * @param file - The File object to upload
 * @param folder - Optional subfolder path (e.g., 'materials', 'assignments')
 * @returns Object with success status, public URL, and file metadata
 */
export async function uploadDocument(
    file: File,
    folder?: string
): Promise<{
    success: boolean;
    publicUrl: string;
    filePath: string;
    filename: string;
    size: number;
}> {
    // Validate file type
    const typeValidation = validateFileType(file.type, file.name);
    if (!typeValidation.valid) {
        throw new StorageError(typeValidation.error!, 'INVALID_FILE_TYPE');
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
        throw new StorageError(sizeValidation.error!, 'FILE_TOO_LARGE');
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        console.error('Supabase storage upload error:', error);
        throw new StorageError(`Upload failed: ${error.message}`, 'UPLOAD_FAILED');
    }

    // Get public URL
    const publicUrl = getPublicUrl(data.path);

    return {
        success: true,
        publicUrl,
        filePath: data.path,
        filename: file.name,
        size: file.size,
    };
}

/**
 * Delete a document from Supabase Storage
 * 
 * @param filePath - The path to the file in storage
 */
export async function deleteDocument(filePath: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error('Supabase storage delete error:', error);
        throw new StorageError(`Delete failed: ${error.message}`, 'DELETE_FAILED');
    }
}

/**
 * Get the public URL for a file in storage
 * 
 * @param filePath - The path to the file in storage
 * @returns The complete public URL
 */
export function getPublicUrl(filePath: string): string {
    const supabaseUrl = getSupabaseUrl();
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
}

/**
 * Check if a file exists in storage
 * 
 * @param filePath - The path to check
 * @returns Boolean indicating if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
            search: filePath.substring(filePath.lastIndexOf('/') + 1),
        });

    if (error) {
        return false;
    }

    return data.length > 0;
}

/**
 * Get file metadata from storage
 */
export async function getFileMetadata(filePath: string) {
    const folder = filePath.substring(0, filePath.lastIndexOf('/')) || '';
    const filename = filePath.substring(filePath.lastIndexOf('/') + 1);

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .list(folder, {
            search: filename,
        });

    if (error || !data.length) {
        throw new StorageError('File not found', 'NOT_FOUND');
    }

    return data[0];
}
