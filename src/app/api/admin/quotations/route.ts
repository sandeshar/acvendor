import { NextRequest, NextResponse } from 'next/server';
import { createQuotation, deleteQuotation, findById, readAll, updateQuotation } from '@/lib/quotations';

export async function GET(req: NextRequest) {
    try {
        const search = req.nextUrl.searchParams;
        const id = search.get('id');
        if (id) {
            const num = parseInt(id);
            if (isNaN(num)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
            const q = await findById(num);
            if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(q);
        }

        const list = await readAll();
        return NextResponse.json(list);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const created = await createQuotation(body);
        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.id || body?.quotationId;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const updated = await updateQuotation(Number(id), body);
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const idParam = req.nextUrl.searchParams.get('id');
        if (!idParam) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const id = parseInt(idParam);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        const ok = await deleteQuotation(id);
        if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
