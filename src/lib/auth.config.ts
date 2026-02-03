/**
 * NextAuth.js Configuration (Lightweight - for Edge Runtime)
 * 
 * This file contains only the configuration without heavy dependencies.
 * It's used by middleware for session validation.
 * The actual authorize logic with Prisma/bcrypt is in auth.ts
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        // JWT callback - runs on Edge, only uses token data
        async jwt({ token, user }) {
            if (user && user.id) {
                token.id = user.id;
                token.role = user.role;
                token.studentId = user.studentId;
                token.gradeId = user.gradeId;
            }
            return token;
        },
        // Session callback - runs on Edge, only uses token data
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
                session.user.studentId = token.studentId as string | undefined;
                session.user.gradeId = token.gradeId as string | undefined;
            }
            return session;
        },
        // Authorized callback - used by middleware for route protection
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Public routes - accessible without authentication
            const publicRoutes = ["/login", "/register", "/"];
            const isPublicRoute = publicRoutes.includes(pathname);

            // API routes are handled separately
            if (pathname.startsWith("/api")) {
                return true;
            }

            // Allow public routes
            if (isPublicRoute) {
                return true;
            }

            // Require login for protected routes
            if (!isLoggedIn) {
                return false; // Redirects to signIn page
            }

            // Role-based access control
            const role = auth?.user?.role;
            const roleAllowedPaths: Record<string, string[]> = {
                ADMIN: ["/admin"],
                TEACHER: ["/teacher", "/admin"],
                STUDENT: ["/student"],
            };

            const allowedPaths = roleAllowedPaths[role as string] || [];
            const isAllowedPath = allowedPaths.some((path) => pathname.startsWith(path));

            if (!isAllowedPath) {
                // Return Response to redirect to appropriate dashboard
                const primaryPath = allowedPaths[0] || "/login";
                return Response.redirect(new URL(primaryPath, nextUrl));
            }

            return true;
        },
    },
    providers: [], // Providers are added in auth.ts (not needed for Edge middleware)
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
