import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { db } from '@/db';
import { storeSettings, footerSections, footerLinks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// Map camelCase payload to snake_case DB columns
function toDb(payload: any) {
    return {
        store_name: payload.storeName ?? '',
        store_description: payload.storeDescription ?? '',
        store_logo: payload.storeLogo ?? payload.logo ?? '',
        favicon: payload.favicon ?? '',
        contact_email: payload.contactEmail ?? '',
        contact_phone: payload.contactPhone ?? '',
        address: payload.address ?? '',
        facebook: payload.facebook ?? '',
        twitter: payload.twitter ?? '',
        instagram: payload.instagram ?? '',
        linkedin: payload.linkedin ?? '',
        meta_title: payload.metaTitle ?? '',
        meta_description: payload.metaDescription ?? '',
        meta_keywords: payload.metaKeywords ?? '',
        footer_text: payload.footerText ?? '',
        // Theme is stored as a simple string identifier (e.g., 'default', 'ocean')
        theme: payload.theme ?? 'default',
        // Boolean flags stored as tinyint(1)
        hide_site_name: payload.hideSiteName ? 1 : 0,
        hide_site_name_on_mobile: payload.hideSiteNameOnMobile ? 1 : 0,
    };
}

// Map DB row to camelCase API shape
function fromDb(row: any) {
    if (!row) return null;
    return {
        id: row.id,
        storeName: row.store_name,
        storeDescription: row.store_description,
        storeLogo: row.store_logo,
        favicon: row.favicon,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        address: row.address,
        facebook: row.facebook,
        twitter: row.twitter,
        instagram: row.instagram,
        linkedin: row.linkedin,
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        metaKeywords: row.meta_keywords,
        footerText: row.footer_text,
        // Theme identifier available to front-end
        theme: row.theme,
        // Whether to remove the site name entirely (all screens)
        hideSiteName: !!row.hide_site_name,
        // Mobile preference: whether to hide the site name on small screens
        hideSiteNameOnMobile: !!row.hide_site_name_on_mobile,
        updatedAt: row.updated_at,
    };
}

export async function GET() {
    try {
        const rows = await db.select().from(storeSettings).limit(1);
        const data = rows.length ? fromDb(rows[0]) : null;

        // Load footer sections + links if we have a store row
        if (data && rows[0]?.id) {
            const secs = await db.select().from(footerSections).where(eq(footerSections.store_id, rows[0].id)).orderBy(asc(footerSections.order));
            const sections: any[] = [];
            for (const s of secs) {
                const links = await db.select().from(footerLinks).where(eq(footerLinks.section_id, s.id)).orderBy(asc(footerLinks.order));
                sections.push({
                    id: s.id,
                    title: s.title,
                    order: s.order,
                    links: links.map((l: any) => ({ id: l.id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })),
                });
            }
            (data as any).footerSections = sections;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('GET /api/store-settings error', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch store settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const update = toDb(body);

        // Read current row (single row table semantics)
        const rows = await db.select().from(storeSettings).limit(1);

        if (rows.length === 0) {
            const result: any = await db.insert(storeSettings).values(update);
            // MySQL2 drizzle returns insertId on result[0].insertId sometimes when not typed; try both
            const insertedId = Array.isArray(result) ? result[0]?.insertId : (result as any)?.insertId;
            const created = await db.select().from(storeSettings).limit(1);
            return NextResponse.json({ success: true, message: 'Store settings created', data: fromDb(created[0]), id: insertedId });
        }

        const id = rows[0].id;
        await db.update(storeSettings).set(update).where(eq(storeSettings.id, id));

        // If footer sections were provided in the payload, replace existing sections/links
        if (body.footerSections && Array.isArray(body.footerSections)) {
            // Delete existing sections + links for this store
            const existing = await db.select().from(footerSections).where(eq(footerSections.store_id, id));
            for (const ex of existing) {
                await db.delete(footerLinks).where(eq(footerLinks.section_id, ex.id));
                await db.delete(footerSections).where(eq(footerSections.id, ex.id));
            }

            // Insert new sections and links
            for (const [sIdx, sec] of body.footerSections.entries()) {
                const secRes: any = await db.insert(footerSections).values({ store_id: id, title: sec.title || '', order: sec.order ?? sIdx });
                const newSecId = Array.isArray(secRes) ? secRes[0]?.insertId : (secRes as any)?.insertId;
                if (sec.links && Array.isArray(sec.links)) {
                    for (const [lIdx, ln] of sec.links.entries()) {
                        await db.insert(footerLinks).values({
                            section_id: newSecId,
                            label: ln.label || '',
                            href: ln.href || '#',
                            is_external: ln.isExternal ? 1 : 0,
                            order: ln.order ?? lIdx,
                        });
                    }
                }
            }
        }

        const updated = await db.select().from(storeSettings).where(eq(storeSettings.id, id)).limit(1);
        try { revalidateTag('store-settings', 'max'); } catch (e) { /* ignore */ }
        // Re-fetch footer sections so response includes them
        const data = fromDb(updated[0]);
        if (data) {
            const secs = await db.select().from(footerSections).where(eq(footerSections.store_id, id)).orderBy(asc(footerSections.order));
            const sections: any[] = [];
            for (const s of secs) {
                const links = await db.select().from(footerLinks).where(eq(footerLinks.section_id, s.id)).orderBy(asc(footerLinks.order));
                sections.push({ id: s.id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l.id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
            }
            (data as any).footerSections = sections;
        }

        return NextResponse.json({ success: true, message: 'Store settings updated', data });
    } catch (error) {
        console.error('PUT /api/store-settings error', error);
        return NextResponse.json({ success: false, error: 'Failed to save store settings' }, { status: 500 });
    }
}
