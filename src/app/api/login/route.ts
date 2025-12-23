import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (user.length && await bcrypt.compare(password, user[0].password)) {
            const payload = { email: user[0].email, id: user[0].id, role: user[0].role };
            const jwtoken = jwt.sign(
                payload,
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );
            const response = NextResponse.json(
                {
                    success: true,
                    message: 'Login successful'
                },
                { status: 200 }
            );
            response.cookies.set('admin_auth', jwtoken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            return response;
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Invalid email or password'
            },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login'
            },
            { status: 500 }
        );
    }
}