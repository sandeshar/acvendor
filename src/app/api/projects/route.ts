import { connectDB } from '@/db';
import { Projects } from '@/db/projectsSchema';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const admin = searchParams.get('admin');
    const limit = searchParams.get('limit');

    try {
        await connectDB();
        const query: any = {};
        if (!admin) {
            query.is_active = true;
        }

        if (category && category !== 'All Projects') {
            query.category = category;
        }

        let dbQuery = Projects.find(query).sort({ display_order: 1 });

        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit));
        }

        const data = await dbQuery.lean();

        const formattedData = data.map((item: any) => ({
            ...item,
            id: item._id.toString()
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const result = await Projects.create(body);
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

        await Projects.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await Projects.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
