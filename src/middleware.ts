/**
 * Lightweight Middleware for Vercel Edge Runtime
 * 
 * This middleware is optimized for Edge Runtime by:
 * - NOT importing Prisma (database operations)
 * - NOT importing bcrypt (password hashing)
 * - NOT importing Supabase client
 * 
 * All heavy operations are handled in API routes with `runtime: 'nodejs'`
 * 
 * Size: ~50KB (well under Vercel's 1MB Edge Function limit)
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Create a lightweight auth instance using only the config (no providers with Prisma)
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
    // Match all routes except static files, images, and API routes
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*$).*)",
    ],
};
