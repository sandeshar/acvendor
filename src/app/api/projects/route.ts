import { db } from '@/db';
import { projects } from '@/db/projectsSchema';
import { NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const admin = searchParams.get('admin');

    try {
        const conditions = [];
        if (!admin) {
            conditions.push(eq(projects.is_active, true));
        }

        if (category && category !== 'All Projects') {
            conditions.push(eq(projects.category, category));
        }

        const data = await db.select()
            .from(projects)
            .where(conditions.length > 0 ? (conditions.length > 1 ? and(...conditions) : conditions[0]) : undefined)
            .orderBy(asc(projects.display_order));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await db.insert(projects).values(body);
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

        await db.update(projects).set(updateData).where(eq(projects.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await db.delete(projects).where(eq(projects.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
