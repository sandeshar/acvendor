import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { footerSections, footerLinks, storeSettings } from '@/db/schema';

// POST - seed footer sections/links and default footer text
export async function POST() {
    try {
        // Ensure we have a store row
        const rows = await db.select().from(storeSettings).limit(1);
        const store = rows[0];
        if (!store) return NextResponse.json({ success: false, error: 'No store settings found. Seed store settings first.' }, { status: 400 });

        // Clean existing footer data
        await db.delete(footerLinks);
        await db.delete(footerSections);

        // Insert default footer sections and links (no 'Connect' — social links are in store settings)
        const defaultSections = [
            {
                title: 'Solutions',
                links: [
                    { label: 'Content Strategy', href: '/services' },
                    { label: 'SEO Writing', href: '/services' },
                    { label: 'Copywriting', href: '/services' },
                    { label: 'Social Media', href: '/services' },
                ],
            },
            {
                title: 'Company',
                links: [
                    { label: 'About Us', href: '/about' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Terms', href: '/terms' },
                    { label: 'Contact', href: '/contact' },
                ],
            },
        ];

        for (const [sIdx, sec] of defaultSections.entries()) {
            const res: any = await db.insert(footerSections).values({ store_id: store.id, title: sec.title || '', order: sIdx });
            const newSecId = Array.isArray(res) ? res[0]?.insertId : (res as any)?.insertId;
            if (sec.links && sec.links.length) {
                for (const [lIdx, link] of sec.links.entries()) {
                    await db.insert(footerLinks).values({ section_id: newSecId, label: link.label, href: link.href, is_external: 0, order: lIdx });
                }
            }
        }

        // Optionally seed a default footer_text if not present
        if (!store.footer_text) {
            await db.update(storeSettings).set({ footer_text: '© ' + new Date().getFullYear() + ' ' + (store.store_name || 'Your Store') + '. All rights reserved.' }).where(eq(storeSettings.id, store.id));
        }

        return NextResponse.json({ success: true, message: 'Footer seeded successfully' });
    } catch (err) {
        console.error('Error seeding footer:', err);
        return NextResponse.json({ success: false, error: 'Failed to seed footer' }, { status: 500 });
    }
}