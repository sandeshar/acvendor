import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { Status } from '@/db/schema';

export async function POST() {
    try {
        await connectDB();

        // Delete existing status entries
        await Status.deleteMany({});

        // Insert status values
        await Status.create([
            { name: 'Draft' },
            { name: 'Published' },
            { name: 'In Review' },
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
