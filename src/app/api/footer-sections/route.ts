import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { FooterSection, FooterLink, StoreSettings } from '@/db/schema';

// Return all footer sections (for the single store row if present)
export async function GET() {
    try {
        await connectDB();
        const storeRow = await StoreSettings.findOne().lean();
        if (!storeRow) return NextResponse.json({ success: true, data: [] });

        const secs = await FooterSection.find({ store_id: storeRow._id }).sort({ order: 1 }).lean();
        const sections: any[] = [];
        for (const s of secs) {
            const links = await FooterLink.find({ section_id: s._id }).sort({ order: 1 }).lean();
            sections.push({ id: s._id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l._id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
        }
        return NextResponse.json({ success: true, data: sections });
    } catch (err) {
        console.error('GET /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch footer sections' }, { status: 500 });
    }
}

// Replace all sections for the store (simple approach)
export async function PUT(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const sections = body.sections;

        const storeRow = await StoreSettings.findOne().lean();
        if (!storeRow) return NextResponse.json({ success: false, error: 'No store settings found' }, { status: 400 });

        // Delete existing sections+links
        const existing = await FooterSection.find({ store_id: storeRow._id }).lean();
        for (const ex of existing) {
            await FooterLink.deleteMany({ section_id: ex._id });
            await FooterSection.findByIdAndDelete(ex._id);
        }

        // Insert new
        for (const [sIdx, sec] of (sections || []).entries()) {
            const newSection = await FooterSection.create({ store_id: storeRow._id, title: sec.title || '', order: sec.order ?? sIdx });
            if (sec.links && Array.isArray(sec.links)) {
                for (const [lIdx, ln] of sec.links.entries()) {
                    await FooterLink.create({ section_id: newSection._id, label: ln.label || '', href: ln.href || '#', is_external: ln.isExternal ? 1 : 0, order: ln.order ?? lIdx });
                }
            }
        }

        // Return new list
        const secs = await FooterSection.find({ store_id: storeRow._id }).sort({ order: 1 }).lean();
        const sectionsRes: any[] = [];
        for (const s of secs) {
            const links = await FooterLink.find({ section_id: s._id }).sort({ order: 1 }).lean();
            sectionsRes.push({ id: s._id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l._id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
        }

        return NextResponse.json({ success: true, data: sectionsRes });

    } catch (err) {
        console.error('PUT /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to update footer sections' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { title, order, links } = body;
        const storeRow = await StoreSettings.findOne().lean();
        if (!storeRow) return NextResponse.json({ success: false, error: 'No store settings found' }, { status: 400 });

        const newSection = await FooterSection.create({ store_id: storeRow._id, title: title || '', order: order ?? 0 });

        if (links && Array.isArray(links)) {
            for (const [lIdx, ln] of links.entries()) {
                await FooterLink.create({ section_id: newSection._id, label: ln.label || '', href: ln.href || '#', is_external: ln.isExternal ? 1 : 0, order: ln.order ?? lIdx });
            }
        }
        return NextResponse.json({ success: true, id: newSection._id });
    } catch (err) {
        console.error('POST /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to create footer section' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        // cascade delete links then section
        await FooterLink.deleteMany({ section_id: id });
        await FooterSection.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to delete footer section' }, { status: 500 });
    }
}