import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { Product, ProductImage } from '@/db/productsSchema';
import { ServiceCategories, ServiceSubcategories } from '@/db/serviceCategoriesSchema';
import { Status, User } from '@/db/schema';

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
        await connectDB();
        
        const reqUrl = new URL(request.url);
        const clean = reqUrl.searchParams.get('clean') === '1' || reqUrl.searchParams.get('clean') === 'true';
        const brand = reqUrl.searchParams.get('brand') || null;

        // Ensure we have a published status and at least one user
        const firstUser = await User.findOne().lean();
        const statusRows = await Status.find().lean();
        const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

        // Require categories to exist (seed services first if missing)
        const someCategory = await ServiceCategories.findOne().lean();
        const someSub = await ServiceSubcategories.findOne().lean();
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
                category_id: someCategory._id,
                subcategory_id: someSub._id,
                statusId: publishedStatus._id,
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
                category_id: someCategory._id,
                subcategory_id: someSub._id,
                statusId: publishedStatus._id,
                featured: 0,
                meta_title: 'Sample Large Product',
                meta_description: 'Demo product used by the seed script',
            },
        ];

        // Determine which subcategories to generate products for
        let subcatRows: any[] = [];
        if (brand) {
            const catRows = await ServiceCategories.find({ brand }).lean();
            const catIds = catRows.map((c: any) => c._id).filter(Boolean);
            if (catIds.length) {
                subcatRows = await ServiceSubcategories.find({ category_id: { $in: catIds } }).lean();
            } else {
                subcatRows = [];
            }
        } else {
            subcatRows = await ServiceSubcategories.find().lean();
        }

        // Generate 3 products per subcategory with brand-aware metadata
        const generated: any[] = [];
        const categoryMap: Record<string, any> = {};
        const catIds = Array.from(new Set(subcatRows.map(s => s.category_id).filter(Boolean)));
        if (catIds.length) {
            const catRows = await ServiceCategories.find({ _id: { $in: catIds } }).lean();
            catRows.forEach((c: any) => (categoryMap[c._id.toString()] = c));
        }

        for (const sc of subcatRows) {
            const parentCat = categoryMap[sc.category_id?.toString()] || null;
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
                const existing = await Product.findOne({ slug: p.slug }).lean();

                if (existing && clean) {
                    try { await ProductImage.deleteMany({ product_id: existing._id }); } catch (e) { }
                    try { await Product.findByIdAndDelete(existing._id); } catch (e) { }
                }

                const already = await Product.findOne({ slug: p.slug }).lean();
                if (already) {
                    results.push({ slug: p.slug, created: false, reason: 'exists' });
                    continue;
                }

                const payload: any = { ...p };
                delete payload.image_urls;
                const result = await Product.create(payload as any);
                const insertId = result._id;
                if (insertId && Array.isArray(p.image_urls) && p.image_urls.length) {
                    const imageInserts = p.image_urls.map((u: string, idx: number) => ({ product_id: insertId, url: u, alt: p.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));
                    try { await ProductImage.create(imageInserts); } catch (e) { logDbError(e, `insert product images ${p.slug}`); }
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
