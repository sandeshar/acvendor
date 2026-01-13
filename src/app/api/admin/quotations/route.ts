import { NextRequest, NextResponse } from 'next/server';
import { createQuotation, deleteQuotation, findById, readAll, updateQuotation } from '@/lib/quotations';
import { returnRole, getUserIdFromToken } from '@/utils/authHelper';

export async function GET(req: NextRequest) {
    try {
        const cookie = req.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const search = req.nextUrl.searchParams;
        const id = search.get('id');
        if (id) {
            const q = await findById(id);
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
        const cookie = req.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const userId = getUserIdFromToken(cookie);
        const created = await createQuotation({ ...body, created_by: userId });
        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const cookie = req.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (!role) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const id = body.id || body?.quotationId;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const updated = await updateQuotation(id, body);
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookie = req.cookies.get('admin_auth')?.value || '';
        const role = returnRole(cookie);

        if (role !== 'superadmin') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            );
        }

        const idParam = req.nextUrl.searchParams.get('id');
        if (!idParam) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const ok = await deleteQuotation(idParam);
        if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
