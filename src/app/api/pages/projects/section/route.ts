import { connectDB } from '@/db';
import { ProjectsSection } from '@/db/projectsSchema';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const section = await ProjectsSection.findOne().lean();
        if (section) {
            return NextResponse.json({
                ...section,
                id: section._id.toString()
            });
        }
        return NextResponse.json(null);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const result = await ProjectsSection.create(body);
        return NextResponse.json({ success: true, id: result._id });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id, ...updateData } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await ProjectsSection.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
