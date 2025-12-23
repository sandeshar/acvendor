import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageTeamSection } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch team section
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const section = await db.select().from(aboutPageTeamSection).where(eq(aboutPageTeamSection.id, parseInt(id))).limit(1);

            if (section.length === 0) {
                return NextResponse.json({ error: 'Team section not found' }, { status: 404 });
            }

            return NextResponse.json(section[0]);
        }

        const section = await db.select().from(aboutPageTeamSection).where(eq(aboutPageTeamSection.is_active, 1)).limit(1);

        if (section.length === 0) {
            return NextResponse.json({ error: 'No active team section found' }, { status: 404 });
        }

        return NextResponse.json(section[0]);
    } catch (error) {
        console.error('Error fetching team section:', error);
        return NextResponse.json({ error: 'Failed to fetch team section' }, { status: 500 });
    }
}

// POST - Create team section
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, is_active = 1 } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const result = await db.insert(aboutPageTeamSection).values({ title, description, is_active });

        revalidateTag('about-team-section', 'max');

        return NextResponse.json(
            { success: true, message: 'Team section created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating team section:', error);
        return NextResponse.json({ error: 'Failed to create team section' }, { status: 500 });
    }
}

// PUT - Update team section
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, title, description, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(aboutPageTeamSection).set(updateData).where(eq(aboutPageTeamSection.id, id));

        revalidateTag('about-team-section', 'max');

        return NextResponse.json({ success: true, message: 'Team section updated successfully' });
    } catch (error) {
        console.error('Error updating team section:', error);
        return NextResponse.json({ error: 'Failed to update team section' }, { status: 500 });
    }
}

// DELETE - Delete team section
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPageTeamSection).where(eq(aboutPageTeamSection.id, parseInt(id)));

        revalidateTag('about-team-section', 'max');

        return NextResponse.json({ success: true, message: 'Team section deleted successfully' });
    } catch (error) {
        console.error('Error deleting team section:', error);
        return NextResponse.json({ error: 'Failed to delete team section' }, { status: 500 });
    }
}
