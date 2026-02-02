import { z } from 'zod';

// Student validation schemas
export const createStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    gradeId: z.string().min(1, 'Grade is required'),
});

export const updateStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    gradeId: z.string().min(1, 'Grade is required').optional(),
    isActive: z.boolean().optional(),
    lockedDueToPayment: z.boolean().optional(),
});

// Material validation schemas
export const createMaterialSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    type: z.enum(['PDF', 'DOC', 'YOUTUBE', 'ONLINE_CLASS']),
    fileUrl: z.string().optional(),
    link: z.string().url('Invalid URL').optional(),
    gradeId: z.string().min(1, 'Grade is required'),
}).refine((data) => {
    // Either fileUrl or link must be provided based on type
    if (data.type === 'PDF' || data.type === 'DOC') {
        return !!data.fileUrl;
    }
    if (data.type === 'YOUTUBE' || data.type === 'ONLINE_CLASS') {
        return !!data.link;
    }
    return true;
}, {
    message: 'File or link is required based on material type',
});

export const updateMaterialSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    description: z.string().optional(),
    gradeId: z.string().min(1, 'Grade is required').optional(),
});

// Payment validation schemas
export const createPaymentSchema = z.object({
    studentId: z.string().min(1, 'Student is required'),
    amount: z.number().positive('Amount must be positive'),
    month: z.number().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.number().min(2020).max(2100, 'Invalid year'),
    dueDate: z.string().or(z.date()),
});

export const updatePaymentSchema = z.object({
    status: z.enum(['PAID', 'UNPAID']),
    paidDate: z.string().or(z.date()).optional(),
});

// Login validation schema - accepts studentId for students, email for admin/teacher
export const loginSchema = z.object({
    identifier: z.string().min(1, 'Student ID or Email is required'),
    password: z.string().min(1, 'Password is required'),
});

// Types
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
