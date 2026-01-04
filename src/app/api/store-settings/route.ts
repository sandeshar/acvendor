import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { connectDB } from '@/db';
import { StoreSettings, FooterSection, FooterLink } from '@/db/schema';

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
        // Optional featured brand for product listing pages (e.g., 'midea')
        featured_brand: payload.featuredBrand ?? payload.featured_brand ?? '',
        // Boolean flags stored as tinyint(1)
        hide_site_name: payload.hideSiteName ? 1 : 0,
        hide_site_name_on_mobile: payload.hideSiteNameOnMobile ? 1 : 0,
    };
}

// Map DB row to camelCase API shape
function fromDb(row: any) {
    if (!row) return null;
    return {
        id: row._id || row.id,
        storeName: row.store_name,
        storeDescription: row.store_description,
        storeLogo: row.store_logo,
        favicon: row.favicon,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        address: row.address,
        pan: row.pan,
        authorizedPerson: row.authorized_person,
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
        // Optional featured brand
        featuredBrand: row.featured_brand || '',
        // Whether to remove the site name entirely (all screens)
        hideSiteName: !!row.hide_site_name,
        // Mobile preference: whether to hide the site name on small screens
        hideSiteNameOnMobile: !!row.hide_site_name_on_mobile,
        updatedAt: row.updated_at,
    };
}

export async function GET() {
    try {
        await connectDB();
        const row = await StoreSettings.findOne().lean();
        const data = row ? fromDb(row) : null;

        // Load footer sections + links if we have a store row
        if (data && row?._id) {
            const secs = await FooterSection.find({ store_id: row._id }).sort({ order: 1 }).lean();
            const sections: any[] = [];
            for (const s of secs) {
                const links = await FooterLink.find({ section_id: s._id }).sort({ order: 1 }).lean();
                sections.push({
                    id: s._id,
                    title: s.title,
                    order: s.order,
                    links: links.map((l: any) => ({ id: l._id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })),
                });
            }
            (data as any).FooterSection = sections;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('GET /api/store-settings error', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch store settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const update = toDb(body);

        // Read current row (single row table semantics)
        const row = await StoreSettings.findOne().lean();

        if (!row) {
            const created = await StoreSettings.create(update);
            const data = fromDb(created);
            return NextResponse.json({ success: true, message: 'Store settings created', data, id: created._id });
        }

        const id = row._id;
        const updated = await StoreSettings.findByIdAndUpdate(id, update, { new: true }).lean();

        // If footer sections were provided in the payload, replace existing sections/links
        if (body.FooterSection && Array.isArray(body.FooterSection)) {
            // Delete existing sections + links for this store
            const existing = await FooterSection.find({ store_id: id }).lean();
            for (const ex of existing) {
                await FooterLink.deleteMany({ section_id: ex._id });
                await FooterSection.findByIdAndDelete(ex._id);
            }

            // Insert new sections and links
            for (const [sIdx, sec] of body.FooterSection.entries()) {
                const newSection = await FooterSection.create({ store_id: id, title: sec.title || '', order: sec.order ?? sIdx });
                if (sec.links && Array.isArray(sec.links)) {
                    for (const [lIdx, ln] of sec.links.entries()) {
                        await FooterLink.create({
                            section_id: newSection._id,
                            label: ln.label || '',
                            href: ln.href || '#',
                            is_external: ln.isExternal ? 1 : 0,
                            order: ln.order ?? lIdx,
                        });
                    }
                }
            }
        }

        try { revalidateTag('store-settings', 'max'); } catch (e) { /* ignore */ }
        // Re-fetch footer sections so response includes them
        const data = fromDb(updated);
        if (data) {
            const secs = await FooterSection.find({ store_id: id }).sort({ order: 1 }).lean();
            const sections: any[] = [];
            for (const s of secs) {
                const links = await FooterLink.find({ section_id: s._id }).sort({ order: 1 }).lean();
                sections.push({ id: s._id, title: s.title, order: s.order, links: links.map((l: any) => ({ id: l._id, label: l.label, href: l.href, isExternal: !!l.is_external, order: l.order })) });
            }
            (data as any).FooterSection = sections;
        }

        return NextResponse.json({ success: true, message: 'Store settings updated', data });
    } catch (error) {
        console.error('PUT /api/store-settings error', error);
        return NextResponse.json({ success: false, error: 'Failed to save store settings' }, { status: 500 });
    }
}
