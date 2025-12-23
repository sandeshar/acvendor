import { returnRole, verifyJWT } from "@/utils/authHelper";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Allow seed UI and seed APIs so first admin can be created
    if (pathname.startsWith('/admin/seed') || pathname.startsWith('/api/seed')) {
        return NextResponse.next();
    }

    // Allow public access to login page and login API
    if (pathname === '/login' || pathname.startsWith('/api/login')) {
        return NextResponse.next();
    }

    // Allow public GET requests to public API endpoints
    if (request.method === 'GET' && pathname.startsWith('/api/pages')) {
        return NextResponse.next();
    }

    // Require authentication for admin routes
    if (pathname.startsWith('/admin')) {
        const cookie = request.cookies.get('admin_auth')?.value || '';
        if (!cookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const verified = verifyJWT(cookie);
        if (!verified) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Require authentication and superadmin role for protected endpoints (excluding seed which is allowed above)
    if ((pathname.startsWith('/api/users') || pathname.startsWith('/api/store-setting')) && request.method !== 'GET') {
        const cookie = request.cookies.get('admin_auth')?.value || '';
        if (!cookie) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        const verified = verifyJWT(cookie);
        if (!verified) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const role = returnRole(cookie);
        if (role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/admin', '/api/:path*', '/api', '/login'],
};
