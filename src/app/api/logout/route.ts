import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
    );

    // Clear the admin_auth cookie. Detect protocol so clearing matches how it was set.
    const forwardedProto = response.headers.get?.('x-forwarded-proto') || '';
    const isSecure = forwardedProto.split(',')[0] === 'https';

    response.cookies.set('admin_auth', '', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // Expire immediately
    });

    return response;
}
