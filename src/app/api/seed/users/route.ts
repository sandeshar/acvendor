import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/utils/authHelper';

export async function POST() {
    try {
        // Only seed a Super Admin if no users exist (avoid foreign key issues)
        const existing = await db.select().from(users);
        if (!existing || existing.length === 0) {
            await db.insert(users).values({
                name: 'Super Admin',
                email: 'admin@contentsolution.np',
                password: await hashPassword('password123'),
                role: 'superadmin',
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Users seeded successfully',
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Users already exist, not modified',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error seeding users:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to seed users',
            },
            { status: 500 }
        );
    }
}
