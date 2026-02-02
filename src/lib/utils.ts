import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, isAfter, startOfMonth } from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Calculate grace period expiry date
 * Grace period is 14 days (2 weeks) from the start of the month
 */
export function getGracePeriodExpiryDate(year: number, month: number): Date {
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || '14');
    return addDays(monthStart, gracePeriodDays);
}

/**
 * Check if student account should be locked due to unpaid payment
 */
export function shouldLockDueToPayment(dueDate: Date): boolean {
    const now = new Date();
    return isAfter(now, dueDate);
}

/**
 * Generate random password
 */
export function generatePassword(length: number = 8): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

/**
 * Validate file type for uploads
 */
export function isValidFileType(fileName: string): boolean {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(sizeInBytes: number): number {
    return sizeInBytes / (1024 * 1024);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeInBytes: number): boolean {
    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
    return getFileSizeMB(sizeInBytes) <= maxSizeMB;
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFileName(fileName: string): string {
    const extension = fileName.slice(fileName.lastIndexOf('.'));
    const name = fileName.slice(0, fileName.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    return `${name}_${timestamp}${extension}`;
}
