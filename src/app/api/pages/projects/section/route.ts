import { db } from '@/db';
import { projectsSection } from '@/db/projectsSchema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const section = await db.select().from(projectsSection).limit(1);
        return NextResponse.json(section[0] || null);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await db.insert(projectsSection).values(body);
        return NextResponse.json({ success: true, id: result[0].insertId });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await db.update(projectsSection).set(updateData).where(eq(projectsSection.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
