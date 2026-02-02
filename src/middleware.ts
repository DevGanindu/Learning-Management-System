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
    const roleRouteMap = {
        ADMIN: '/admin',
        TEACHER: '/teacher',
        STUDENT: '/student',
    };

    const allowedBasePath = roleRouteMap[role];

    // Check if user is accessing their allowed path
    if (!pathname.startsWith(allowedBasePath)) {
        return NextResponse.redirect(new URL(allowedBasePath, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
