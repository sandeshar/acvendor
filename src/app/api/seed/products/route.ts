import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages } from '@/db/productsSchema';
import { serviceCategories, serviceSubcategories } from '@/db/serviceCategoriesSchema';
import { status, users } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

function logDbError(e: any, context = '') {
    try {
        console.error('DB Error', context ? `(${context})` : '', e?.message || e, {
            code: e?.code,
            errno: e?.errno,
            sql: e?.sql || e?.cause?.sql,
            params: e?.params || e?.cause?.params,
        });
    } catch (err) {
        console.error('Failed to log DB error', err);
    }
}

export async function POST(request: Request) {
    try {
        const reqUrl = new URL(request.url);
        const clean = reqUrl.searchParams.get('clean') === '1' || reqUrl.searchParams.get('clean') === 'true';
        const brand = reqUrl.searchParams.get('brand') || null;

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

        // Base sample products linked to an existing category/subcategory
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

        // Determine which subcategories to generate products for
        let subcatRows: any[] = [];
        if (brand) {
            const catRows = await db.select().from(serviceCategories).where(eq(serviceCategories.brand, brand));
            const catIds = catRows.map((c: any) => c.id).filter(Boolean);
            if (catIds.length) {
                subcatRows = await db.select().from(serviceSubcategories).where(inArray(serviceSubcategories.category_id, catIds));
            } else {
                subcatRows = [];
            }
        } else {
            subcatRows = await db.select().from(serviceSubcategories);
        }

        // Generate 3 products per subcategory with brand-aware metadata
        const generated: any[] = [];
        const categoryMap: Record<number, any> = {};
        const catIds = Array.from(new Set(subcatRows.map(s => s.category_id).filter(Boolean)));
        if (catIds.length) {
            const catRows = await db.select().from(serviceCategories).where(inArray(serviceCategories.id, catIds));
            catRows.forEach((c: any) => (categoryMap[c.id] = c));
        }

        for (const sc of subcatRows) {
            const parentCat = categoryMap[sc.category_id] || null;
            for (let i = 1; i <= 3; i++) {
                const slug = `${sc.slug}-prod-${i}`;
                const brandPrefix = parentCat && parentCat.brand ? `${(parentCat.brand || '').toUpperCase()} ` : '';
                const title = `${brandPrefix}${sc.name} Product ${i}`;
                const excerpt = `${brandPrefix}${sc.name} sample product #${i}.`;

                generated.push({
                    slug,
                    title,
                    excerpt,
                    content: `<p>Example product in ${sc.name}${parentCat ? ' / ' + parentCat.name : ''}, variation ${i}.</p>`,
                    thumbnail: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80&ixid=${i}`,
                    image_urls: [`https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80&ixid=${i}`],
                    price: (99 + i * 50).toFixed(2),
                    currency: 'USD',
                    inventory_status: 'in_stock',
                    model: `${(parentCat?.brand || sc.slug).toUpperCase()}-${i}`,
                    capacity: sc.ac_type || 'N/A',
                    warranty: `${i} year${i > 1 ? 's' : ''}`,
                    category_id: sc.category_id,
                    subcategory_id: sc.id,
                    statusId: publishedStatus.id,
                    featured: i === 1 ? 1 : 0,
                    meta_title: `${brandPrefix}${sc.name} Product ${i}`,
                    meta_description: `${excerpt} Part of ${parentCat ? parentCat.name : sc.name} category${parentCat?.brand ? ` for ${parentCat.brand}` : ''}`,
                });
            }
        }

        const samples = [...baseSamples, ...generated];

        for (const p of samples) {
            try {
                const [existing] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);

                if (existing && clean) {
                    try { await db.delete(productImages).where(eq(productImages.product_id, existing.id)); } catch (e) { }
                    try { await db.delete(products).where(eq(products.id, existing.id)); } catch (e) { }
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
                    const imageInserts = p.image_urls.map((u: string, idx: number) => ({ product_id: insertId, url: u, alt: p.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));
                    try { await db.insert(productImages).values(imageInserts); } catch (e) { logDbError(e, `insert product images ${p.slug}`); }
                }

                results.push({ slug: p.slug, created: true, id: insertId });
            } catch (e: any) {
                logDbError(e, `seed product ${p.slug}`);
                results.push({ slug: p.slug, created: false, error: e?.message || String(e) });
            }
        }

        return NextResponse.json({ success: true, message: 'Products seeded', results }, { status: 201 });
    } catch (error) {
        logDbError(error, 'seeding products');
        return NextResponse.json({ error: 'Failed to seed products', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
