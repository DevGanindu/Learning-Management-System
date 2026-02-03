import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
    const session = req.auth;
    const { pathname } = req.nextUrl;

    // Public routes - accessible without authentication
    const publicRoutes = ['/login', '/register', '/'];
    if (publicRoutes.includes(pathname)) {
        // If logged in, redirect to appropriate dashboard (except for register)
        if (session?.user && pathname !== '/register') {
            const redirectMap = {
                ADMIN: '/admin',
                TEACHER: '/teacher',
                STUDENT: '/student',
            };
            return NextResponse.redirect(
                new URL(redirectMap[session.user.role], req.url)
            );
        }
        return NextResponse.next();
    }

    // Protected routes - require authentication
    if (!session?.user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const { role } = session.user;

    // Role-based route protection
    // Teachers now have admin privileges and can access both /teacher and /admin routes
    const roleAllowedPaths: Record<string, string[]> = {
        ADMIN: ['/admin'],
        TEACHER: ['/teacher', '/admin'],  // Teachers can access admin routes
        STUDENT: ['/student'],
    };

    const allowedPaths = roleAllowedPaths[role] || [];

    // Check if user is accessing their allowed paths
    const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));
    
    if (!isAllowedPath) {
        // Redirect to primary dashboard
        const primaryPath = allowedPaths[0] || '/login';
        return NextResponse.redirect(new URL(primaryPath, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
