import { NextResponse } from 'next/server';
import { db } from '@/db';
import { status } from '@/db/schema';

export async function POST() {
    try {
        // Delete existing status entries
        await db.delete(status);

        // Insert status values
        await db.insert(status).values([
            { id: 1, name: 'Draft' },
            { id: 2, name: 'Published' },
            { id: 3, name: 'In Review' },
        ]);

        return NextResponse.json({
            success: true,
            message: 'Status table seeded successfully'
        });
    } catch (error) {
        console.error('Error seeding status:', error);
        return NextResponse.json(
            { error: 'Failed to seed status table' },
            { status: 500 }
        );
    }
}
