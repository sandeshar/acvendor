import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages } from '@/db/productsSchema';
import { serviceCategories, serviceSubcategories } from '@/db/serviceCategoriesSchema';
import { status, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        // Allow an optional ?clean=1 query param to force re-creation
        const url = new URL(request.url);
        const clean = url.searchParams.get('clean') === '1' || url.searchParams.get('clean') === 'true';

        // Ensure we have a published status and at least one user
        const [firstUser] = await db.select().from(users).limit(1);
        const statusRows = await db.select().from(status);
        const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

        // Require categories to exist (seed services first if missing)
        const [someCategory] = await db.select().from(serviceCategories).limit(1);
        const [someSub] = await db.select().from(serviceSubcategories).limit(1);
        if (!someCategory || !someSub) {
            return NextResponse.json({ message: 'No product categories found. Run /api/seed/services first' }, { status: 200 });
        }

        if (!firstUser || !publishedStatus) {
            return NextResponse.json({ error: 'Missing required data (users/status)' }, { status: 400 });
        }

        const results: any[] = [];

        // Sample products (base) and generated products per subcategory
        const baseSamples = [
            {
                slug: 'sample-mini-1',
                title: 'Sample Mini Product — Compact & Efficient',
                excerpt: 'A compact sample product for demonstrations.',
                content: '<p>Sample product description that highlights features and specs.</p>',
                thumbnail: 'https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1400&q=80',
                image_urls: ['https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1200&q=80'],
                price: '199.00',
                currency: 'USD',
                inventory_status: 'in_stock',
                model: 'SAMPLE-1',
                capacity: 'N/A',
                warranty: '1 year',
                category_id: someCategory.id,
                subcategory_id: someSub.id,
                statusId: publishedStatus.id,
                featured: 1,
                meta_title: 'Sample Mini Product',
                meta_description: 'Demo product used by the seed script',
            },
            {
                slug: 'sample-large-1',
                title: 'Sample Large Product — Heavy Duty',
                excerpt: 'A larger sample for showrooms.',
                content: '<p>Robust sample product for larger demonstrations.</p>',
                thumbnail: 'https://images.unsplash.com/photo-1549399546-9d4d5f5d93d0?auto=format&fit=crop&w=1400&q=80',
                image_urls: ['https://images.unsplash.com/photo-1549399546-9d4d5f5d93d0?auto=format&fit=crop&w=1200&q=80'],
                price: '499.00',
                currency: 'USD',
                inventory_status: 'in_stock',
                model: 'SAMPLE-2',
                capacity: 'N/A',
                warranty: '2 years',
                category_id: someCategory.id,
                subcategory_id: someSub.id,
                statusId: publishedStatus.id,
                featured: 0,
                meta_title: 'Sample Large Product',
                meta_description: 'Demo product used by the seed script',
            },
        ];

        // Generate additional sample products across all subcategories (3 per subcategory)
        const subcatRows = await db.select().from(serviceSubcategories);
        const generated: any[] = [];
        for (const sc of subcatRows) {
            for (let i = 1; i <= 3; i++) {
                const slug = `${sc.slug}-prod-${i}`;
                generated.push({
                    slug,
                    title: `${sc.name} Product ${i}`,
                    excerpt: `A ${sc.name.toLowerCase()} product example #${i}.`,
                    content: `<p>Example product in ${sc.name} category, variation ${i}.</p>`,
                    thumbnail: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80&ixid=${i}`,
                    image_urls: [`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&ixid=${i}`],
                    price: (99 + i * 50).toFixed(2),
                    currency: 'USD',
                    inventory_status: 'in_stock',
                    model: `${sc.slug.toUpperCase()}-${i}`,
                    capacity: 'N/A',
                    warranty: `${i} year${i > 1 ? 's' : ''}`,
                    category_id: sc.category_id,
                    subcategory_id: sc.id,
                    statusId: publishedStatus.id,
                    featured: i === 1 ? 1 : 0,
                    meta_title: `${sc.name} Product ${i}`,
                    meta_description: `Seed product in ${sc.name}`,
                });
            }
        }

        const samples = [...baseSamples, ...generated];

        for (const p of samples) {
            try {
                const [existing] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);

                if (existing && clean) {
                    // delete images and product so we can recreate
                    try {
                        await db.delete(productImages).where(eq(productImages.product_id, existing.id));
                    } catch (e) { /* ignore */ }
                    try {
                        await db.delete(products).where(eq(products.id, existing.id));
                    } catch (e) { /* ignore */ }
                }

                const [already] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
                if (already) {
                    results.push({ slug: p.slug, created: false, reason: 'exists' });
                    continue;
                }

                const payload: any = { ...p };
                delete payload.image_urls;
                const result = await db.insert(products).values(payload as any);
                const insertId = result?.[0]?.insertId;
                if (insertId && Array.isArray(p.image_urls) && p.image_urls.length) {
                    const imageInserts = p.image_urls.map((url: string, idx: number) => ({
                        product_id: insertId,
                        url,
                        alt: p.title || '',
                        is_primary: idx === 0 ? 1 : 0,
                        display_order: idx,
                    }));
                    try {
                        await db.insert(productImages).values(imageInserts);
                    } catch (e) {
                        console.warn('Failed to insert product images for', p.slug, e);
                    }
                }

                results.push({ slug: p.slug, created: true, id: insertId });
            } catch (e: any) {
                console.warn('Failed to seed product', p.slug, e);
                results.push({ slug: p.slug, created: false, error: e?.message || String(e) });
            }
        }

        return NextResponse.json({ success: true, message: 'Products seeded', results }, { status: 201 });
    } catch (error) {
        console.error('Error seeding products:', error);
        return NextResponse.json({ error: 'Failed to seed products', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
