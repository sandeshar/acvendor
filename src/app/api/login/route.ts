import { connectDB } from '@/db';
import { User } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        await connectDB();
        const { email, password } = await request.json();
        const user = await User.findOne({ email }).lean();

        if (user && await bcrypt.compare(password, user.password)) {
            const payload = { email: user.email, id: user._id, role: user.role };
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