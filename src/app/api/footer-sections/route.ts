import { NextResponse } from 'next/server';
import { db } from '@/db';
import { footerSections, footerLinks, storeSettings } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// Return all footer sections (for the single store row if present)
export async function GET() {
    try {
        const store = await db.select().from(storeSettings).limit(1);
        const storeRow = store[0];
        if (!storeRow) return NextResponse.json({ success: true, data: [] });

        const secs = await db.select().from(footerSections).where(eq(footerSections.store_id, storeRow.id)).orderBy(asc(footerSections.order));
        const sections: any[] = [];
        for (const s of secs) {
            const links = await db.select().from(footerLinks).where(eq(footerLinks.section_id, s.id)).orderBy(asc(footerLinks.order));
            sections.push({ id: s.id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l.id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
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
        const body = await request.json();
        const sections = body.sections;

        const store = await db.select().from(storeSettings).limit(1);
        const storeRow = store[0];
        if (!storeRow) return NextResponse.json({ success: false, error: 'No store settings found' }, { status: 400 });

        // Delete existing sections+links
        const existing = await db.select().from(footerSections).where(eq(footerSections.store_id, storeRow.id));
        for (const ex of existing) {
            await db.delete(footerLinks).where(eq(footerLinks.section_id, ex.id));
            await db.delete(footerSections).where(eq(footerSections.id, ex.id));
        }

        // Insert new
        for (const [sIdx, sec] of (sections || []).entries()) {
            const secRes: any = await db.insert(footerSections).values({ store_id: storeRow.id, title: sec.title || '', order: sec.order ?? sIdx });
            const newSecId = Array.isArray(secRes) ? secRes[0]?.insertId : (secRes as any)?.insertId;
            if (sec.links && Array.isArray(sec.links)) {
                for (const [lIdx, ln] of sec.links.entries()) {
                    await db.insert(footerLinks).values({ section_id: newSecId, label: ln.label || '', href: ln.href || '#', is_external: ln.isExternal ? 1 : 0, order: ln.order ?? lIdx });
                }
            }
        }

        // Return new list
        const secs = await db.select().from(footerSections).where(eq(footerSections.store_id, storeRow.id)).orderBy(asc(footerSections.order));
        const sectionsRes: any[] = [];
        for (const s of secs) {
            const links = await db.select().from(footerLinks).where(eq(footerLinks.section_id, s.id)).orderBy(asc(footerLinks.order));
            sectionsRes.push({ id: s.id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l.id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
        }

        return NextResponse.json({ success: true, data: sectionsRes });

    } catch (err) {
        console.error('PUT /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to update footer sections' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, order, links } = body;
        const store = await db.select().from(storeSettings).limit(1);
        const storeRow = store[0];
        if (!storeRow) return NextResponse.json({ success: false, error: 'No store settings found' }, { status: 400 });

        const secRes: any = await db.insert(footerSections).values({ store_id: storeRow.id, title: title || '', order: order ?? 0 });
        const newSecId = Array.isArray(secRes) ? secRes[0]?.insertId : (secRes as any)?.insertId;

        if (links && Array.isArray(links)) {
            for (const [lIdx, ln] of links.entries()) {
                await db.insert(footerLinks).values({ section_id: newSecId, label: ln.label || '', href: ln.href || '#', is_external: ln.isExternal ? 1 : 0, order: ln.order ?? lIdx });
            }
        }
        return NextResponse.json({ success: true, id: newSecId });
    } catch (err) {
        console.error('POST /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to create footer section' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        // cascade delete links then section
        await db.delete(footerLinks).where(eq(footerLinks.section_id, id));
        await db.delete(footerSections).where(eq(footerSections.id, id));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/footer-sections', err);
        return NextResponse.json({ success: false, error: 'Failed to delete footer section' }, { status: 500 });
    }
}