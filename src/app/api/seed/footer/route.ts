import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { FooterSection, FooterLink, StoreSettings } from '@/db/schema';

// POST - seed footer sections/links and default footer text
export async function POST() {
    try {
        await connectDB();

        // Ensure we have a store row; create one if missing so footer can be seeded independently
        let store = await StoreSettings.findOne().lean();
        if (!store) {
            store = (await StoreSettings.create({
                store_name: 'AC Vendor',
                store_description: 'Your trusted source for air conditioners, parts, and installation services.',
                store_logo: '/logo.png',
                favicon: '/favicon.ico',
                contact_email: 'support@acvendor.com',
                contact_phone: '+977 9800000000',
                address: 'Kathmandu, Nepal',
                // Provide non-empty social links so schema `required` validations pass
                facebook: 'https://facebook.com/acvendor',
                twitter: 'https://twitter.com/acvendor',
                instagram: 'https://instagram.com/acvendor',
                linkedin: 'https://linkedin.com/company/acvendor',
                // Required corporate fields
                pan: 'N/A',
                authorized_person: 'Admin',
                featured_brand: 'midea',
                meta_title: 'AC Vendor - Air Conditioners and Installation',
                meta_description: 'Shop the best air conditioners, parts, and professional installation services.',
                meta_keywords: 'AC, air conditioner, installation, compressor, split AC',
                footer_text: `© ${new Date().getFullYear()} AC Vendor. All rights reserved.`,
            }))?.toObject?.() || (await StoreSettings.findOne().lean());
        }

        // Clean existing footer data
        await FooterLink.deleteMany({});
        await FooterSection.deleteMany({});

        // Insert default footer sections and links (no 'Connect' — social links are in store settings)
        const defaultSections = [
            {
                title: 'Products',
                links: [
                    { label: 'All Products', href: '/midea-ac' },
                    { label: 'Brands', href: '/brands' },
                    { label: 'Installation', href: '/services' },
                    { label: 'Contact', href: '/contact' },
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
            const res = await FooterSection.create({ store_id: store._id, title: sec.title || '', order: sIdx });
            const newSecId = res._id;
            if (sec.links && sec.links.length) {
                for (const [lIdx, link] of sec.links.entries()) {
                    await FooterLink.create({ section_id: newSecId, label: link.label, href: link.href, is_external: 0, order: lIdx });
                }
            }
        }

        // Optionally seed a default footer_text if not present
        if (!store.footer_text) {
            await StoreSettings.findByIdAndUpdate(store._id, { footer_text: '© ' + new Date().getFullYear() + ' ' + (store.store_name || 'Your Store') + '. All rights reserved.' });
        }

        return NextResponse.json({ success: true, message: 'Footer seeded successfully' });
    } catch (err) {
        console.error('Error seeding footer:', err);
        return NextResponse.json({ success: false, error: 'Failed to seed footer' }, { status: 500 });
    }
}