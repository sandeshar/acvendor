import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { aboutPageTeamMembers } from '@/db/aboutPageSchema';
import { revalidateTag } from 'next/cache';

// GET - Fetch team members
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (id) {
            const member = await db.select().from(aboutPageTeamMembers).where(eq(aboutPageTeamMembers.id, parseInt(id))).limit(1);

            if (member.length === 0) {
                return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
            }

            return NextResponse.json(member[0]);
        }

        const members = await db.select().from(aboutPageTeamMembers)
            .where(eq(aboutPageTeamMembers.is_active, 1))
            .orderBy(asc(aboutPageTeamMembers.display_order));

        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }
}

// POST - Create team member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, role, description, image, image_alt, display_order, is_active = 1 } = body;

        if (!name || !role || !description || !image || !image_alt || display_order === undefined) {
            return NextResponse.json(
                { error: 'Name, role, description, image, image_alt, and display_order are required' },
                { status: 400 }
            );
        }

        const result = await db.insert(aboutPageTeamMembers).values({
            name,
            role,
            description,
            image,
            image_alt,
            display_order,
            is_active,
        });

        revalidateTag('about-team-members', 'max');

        return NextResponse.json(
            { success: true, message: 'Team member created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating team member:', error);
        return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
    }
}

// PUT - Update team member
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, role, description, image, image_alt, display_order, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (image_alt !== undefined) updateData.image_alt = image_alt;
        if (display_order !== undefined) updateData.display_order = display_order;
        if (is_active !== undefined) updateData.is_active = is_active;

        await db.update(aboutPageTeamMembers).set(updateData).where(eq(aboutPageTeamMembers.id, id));

        revalidateTag('about-team-members', 'max');

        return NextResponse.json({ success: true, message: 'Team member updated successfully' });
    } catch (error) {
        console.error('Error updating team member:', error);
        return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }
}

// DELETE - Delete team member
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await db.delete(aboutPageTeamMembers).where(eq(aboutPageTeamMembers.id, parseInt(id)));

        revalidateTag('about-team-members', 'max');

        return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }
}
