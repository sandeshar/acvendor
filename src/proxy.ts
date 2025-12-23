import { returnRole } from "@/utils/authHelper";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const cookie = request.cookies.get('admin_auth')?.value || '';
    const role = returnRole(cookie);

    // Public auth endpoints
    if (pathname === '/login' || pathname.startsWith('/api/login')) {
        return NextResponse.next();
    }

    // Allow seed operations if no users exist (initial setup)
    if (pathname.startsWith('/api/seed') || pathname.startsWith('/admin/seed')) {
        try {
            const origin = new URL(request.url).origin;
            const res = await fetch(`${origin}/api/users`);
            if (res.ok) {
                const userList = await res.json();
                const hasUsers = Array.isArray(userList) && userList.length > 0;

                if (hasUsers && role !== 'superadmin') {
                    return NextResponse.json(
                        { error: 'Forbidden: Only superadmins can seed data' },
                        { status: 403 }
                    );
                }
            }
        } catch (error) {
            // If the API check fails, allow it to proceed (might be initial setup)
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/admin') && !cookie && !role) {

        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow public contact form submissions
    if (pathname.startsWith('/api/pages/contact/submissions') && request.method === 'POST') {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api') && (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
        // Allow login and logout without auth
        if (pathname.startsWith('/api/login') || pathname.startsWith('/api/logout')) {
            return NextResponse.next();
        }

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }
    }
    if ((pathname.startsWith('/api/users') || pathname.startsWith('/api/store-setting') || pathname.startsWith('/api/pages') || pathname.startsWith('/api/seed')) && role !== 'superadmin' && request.method !== 'GET') {
        return NextResponse.json(
            { error: 'Forbidden: Insufficient permissions' },
            { status: 403 }
        );
    }

    return NextResponse.next();
}