import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    servicesPageHero,
    servicesPageDetails,
    servicesPageProcessSection,
    servicesPageProcessSteps,
    servicesPageCTA,
    servicesPageFeatures,
    servicesPageBrands,
    servicesPageTrust,
} from '@/db/servicesPageSchema';
import { products, productImages } from '@/db/productsSchema';
import { servicePosts } from '@/db/servicePostsSchema';
import { serviceCategories, serviceSubcategories } from '@/db/serviceCategoriesSchema';
import { reviewTestimonials } from '@/db/reviewSchema';
import { shopPageHero } from '@/db/shopPageSchema';
import { status, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    // hoist some vars to function scope to avoid block-scope issues
    let firstUser: any = null;
    let publishedStatus: any = null;
    let clean = false;
    let brandParam: string | null = null;

    try {
        const reqUrl = new URL(request.url);
        brandParam = reqUrl.searchParams.get('brand');
        clean = reqUrl.searchParams.get('clean') === '1' || reqUrl.searchParams.get('clean') === 'true';

        const usersRows = await db.select().from(users).limit(1);
        firstUser = usersRows[0];
        const statusRows = await db.select().from(status);
        publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

        if (!firstUser || !publishedStatus) {
            return NextResponse.json({ error: 'Missing required data (users/status)' }, { status: 400 });
        }

        const brandsToSeed = [
            { name: 'Midea', slug: 'midea' },
            { name: 'LG', slug: 'lg' },
            { name: 'GREE', slug: 'gree' },
            { name: 'SAMSUNG', slug: 'samsung' },
            { name: 'DAIKIN', slug: 'daikin' },
        ];

        const acTypes = [
            { name: 'Inverter', slug: 'inverter', ac_type: 'Inverter' },
            { name: 'Split', slug: 'split', ac_type: 'Split' },
            { name: 'Window', slug: 'window', ac_type: 'Window' },
            { name: 'Cassette', slug: 'cassette', ac_type: 'Cassette' },
            { name: 'Commercial', slug: 'commercial', ac_type: 'Commercial' },
        ];

        // Filter brands if a specific brand param is provided
        const targetBrands = brandParam ? brandsToSeed.filter(b => b.slug === brandParam) : brandsToSeed;

        for (const b of targetBrands) {
            // Ensure category exists (idempotent)
            const [existingBrand] = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, b.slug)).limit(1);
            let brandId: number | null = null;
            if (!existingBrand) {
                const res: any = await db.insert(serviceCategories).values({
                    name: b.name,
                    slug: b.slug,
                    brand: b.slug,
                    description: `${b.name} air conditioners and authorized products`,
                    icon: 'ac_unit',
                    thumbnail: '',
                    display_order: 1,
                    is_active: 1,
                    meta_title: `${b.name} AC`,
                    meta_description: `Authorized ${b.name} air conditioners and spare parts`,
                });
                brandId = Array.isArray(res) ? res[0]?.insertId : (res as any)?.insertId;
            } else {
                brandId = existingBrand.id;
                await db.update(serviceCategories).set({ brand: b.slug }).where(eq(serviceCategories.id, existingBrand.id));
            }

            // Seed subcategories for the brand
            for (const t of acTypes) {
                const subSlug = `${b.slug}-${t.slug}`;
                const [existingSub] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, subSlug)).limit(1);
                if (!existingSub) {
                    await db.insert(serviceSubcategories).values({
                        category_id: brandId as number,
                        name: t.name,
                        ac_type: t.ac_type,
                        slug: subSlug,
                        description: `${t.name} models from ${b.name}`,
                        icon: 'ac_unit',
                        thumbnail: '',
                        display_order: 1,
                        is_active: 1,
                        meta_title: `${b.name} ${t.name}`,
                        meta_description: `Explore ${b.name} ${t.name} air conditioners`,
                    });
                } else if (clean) {
                    // if clean requested, remove existing products for this subcategory so we can re-create
                    try {
                        await db.delete(products).where(eq(products.subcategory_id, existingSub.id));
                    } catch (e) { /* ignore */ }
                }

                // Insert 1-2 sample products per brand/subcategory (idempotent)
                try {
                    const [sub] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, subSlug)).limit(1);
                    for (let i = 1; i <= 2; i++) {
                        const pslug = `${b.slug}-${t.slug}-sample-${i}`;
                        const [existingProd] = await db.select().from(products).where(eq(products.slug, pslug)).limit(1);
                        if (existingProd && !clean) continue;
                        if (existingProd && clean) {
                            try { await db.delete(productImages).where(eq(productImages.product_id, existingProd.id)); } catch (e) { }
                            try { await db.delete(products).where(eq(products.id, existingProd.id)); } catch (e) { }
                        }

                        const title = `${b.name} ${t.name} ${i}`;
                        const res: any = await db.insert(products).values({
                            slug: pslug,
                            title,
                            excerpt: `${b.name} ${t.name} sample model ${i}`,
                            content: `<p>${b.name} ${t.name} sample product ${i}</p>`,
                            thumbnail: '',
                            price: '99900.00',
                            compare_at_price: null,
                            currency: 'NRS',
                            inventory_status: 'in_stock',
                            model: `${b.slug.toUpperCase()}-${t.slug.toUpperCase()}-${i}`,
                            capacity: t.ac_type,
                            warranty: '2 years',
                            category_id: brandId,
                            subcategory_id: sub?.id || null,
                            statusId: publishedStatus.id,
                            featured: i === 1 ? 1 : 0,
                            meta_title: title,
                            meta_description: `Seeded ${b.name} ${t.name}`,
                        });

                        const insertId = Array.isArray(res) ? res[0]?.insertId : (res as any)?.insertId;
                        if (insertId) {
                            try {
                                await db.insert(productImages).values({
                                    product_id: insertId,
                                    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                                    alt: title,
                                    is_primary: 1,
                                    display_order: 0,
                                });
                            } catch (e) { logDbError(e, `insert product image ${title}`); }
                        }
                    }
                } catch (e) {
                    logDbError(e, `seed products for ${b.slug}/${t.slug}`);
                }
            }
        }

        // Seed services page trusted brand entries (idempotent)

        // Seed default Shop hero if missing
        try {
            const [shopHero] = await db.select().from(shopPageHero).limit(1);
            if (!shopHero) {
                await db.insert(shopPageHero).values({
                    tagline: 'OFFICIAL DISTRIBUTORS',
                    title: 'Shop By Brand',
                    subtitle: "Compare features and prices across trusted brands",
                    description: 'Explore top brands and handpicked models for Nepali homes and businesses.',
                    cta_text: 'Browse Catalog',
                    cta_link: '/midea-ac',
                    background_image: 'https://images.unsplash.com/photo-1592854936919-59d5e9f6f2a3?auto=format&fit=crop&w=1400&q=80',
                    hero_image_alt: 'Showcase of air conditioners',
                    is_active: 1,
                });
            }
        } catch (e) { /* non-fatal */ }

        // Seed additional static content if missing (idempotent checks)
        const [heroExists] = await db.select().from(servicesPageHero).limit(1);
        if (!heroExists) {
            await db.insert(servicesPageHero).values({
                tagline: 'OUR SERVICES',
                title: 'Quality Air Conditioners & Parts',
                description: 'Explore a wide range of AC units, parts, and installation services from trusted brands.',
                badge_text: 'Free Installation Offer',
                highlight_text: 'Air Conditioners',
                primary_cta_text: 'Shop Products',
                primary_cta_link: '/midea-ac',
                secondary_cta_text: 'Request Installation',
                secondary_cta_link: '/contact',
                background_image: 'https://images.unsplash.com/photo-1582719478250-1a1285b6b2f1?auto=format&fit=crop&w=1400&q=80',
                hero_image_alt: 'Assortment of air conditioners in a store',
                stat1_value: '20+',
                stat1_label: 'Brands',
                stat2_value: '8k+',
                stat2_label: 'Installations',
                stat3_value: '10k+',
                stat3_label: 'Satisfied Customers',
                is_active: 1,
            });
        }

        // Ensure a content category and its subcategories exist
        const contentSlug = 'content';
        const [contentCat] = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, contentSlug)).limit(1);
        if (!contentCat) {
            await db.insert(serviceCategories).values({
                name: 'Content',
                slug: contentSlug,
                description: 'SEO, social and copy services to grow your brand.',
                icon: 'category',
                thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
                display_order: 1,
                is_active: 1,
                meta_title: 'Content',
                meta_description: 'Explore SEO, social, and website copy services.',
            });
        }

        const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, contentSlug)).limit(1);

        const serviceData = [
            { key: 'seo', icon: 'search', title: 'SEO', description: 'Search-optimized articles and landing pages.', bullets: ['Keyword research', 'On-page SEO', 'Long-form content'], image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80', image_alt: 'Content strategist reviewing SEO metrics on a laptop' },
            { key: 'social', icon: 'thumb_up', title: 'Social', description: 'Platform posts and short-form video content.', bullets: ['Content calendars', 'Short video hooks', 'Design kits'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80', image_alt: 'Team planning social content with phones and laptops' },
            { key: 'copy', icon: 'language', title: 'Copy', description: 'Conversion-focused website copy and microcopy.', bullets: ['Value prop', 'Landing pages', 'Microcopy'], image: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80', image_alt: 'Copywriter drafting website copy next to design mockups' },
        ];

        const subcategoryMap: Record<string, number> = {};
        for (const [index, s] of serviceData.entries()) {
            const [existingSub] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, s.key)).limit(1);
            if (!existingSub) {
                await db.insert(serviceSubcategories).values({
                    category_id: category?.id as number,
                    name: s.title,
                    slug: s.key,
                    description: s.description,
                    icon: s.icon,
                    thumbnail: s.image,
                    display_order: index + 1,
                    is_active: 1,
                    meta_title: s.title,
                    meta_description: s.description,
                });
                const [subcat] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, s.key)).limit(1);
                if (subcat?.id) subcategoryMap[s.key] = subcat.id as number;
            } else {
                subcategoryMap[s.key] = existingSub.id as number;
            }
        }

        for (const [index, s] of serviceData.entries()) {
            const [existingDetail] = await db.select().from(servicesPageDetails).where(eq(servicesPageDetails.key, s.key)).limit(1);
            if (!existingDetail) {
                await db.insert(servicesPageDetails).values({
                    key: s.key,
                    icon: s.icon,
                    title: s.title,
                    description: s.description,
                    bullets: JSON.stringify(s.bullets),
                    image: s.image,
                    image_alt: s.image_alt || '',
                    display_order: index + 1,
                    is_active: 1,
                });

                const variantContent = (() => {
                    let out = `<h1>${s.title}</h1>`;
                    for (let i = 1; i <= 4; i++) out += `<h2>Section ${i}</h2><p>${s.title} paragraph ${i} with practical advice and examples.</p>`;
                    out += `<h2>Conclusion</h2><p>Summary and next steps.</p>`;
                    return out;
                })();

                const [existingPost] = await db.select().from(servicePosts).where(eq(servicePosts.slug, `${s.key}-guide`)).limit(1);
                if (!existingPost) {
                    await db.insert(servicePosts).values({
                        slug: `${s.key}-guide`,
                        title: `${s.title} — guide`,
                        excerpt: s.description,
                        content: variantContent,
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?.id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser.id,
                        statusId: publishedStatus.id,
                        meta_title: `${s.title} — guide`,
                        meta_description: `Professional ${s.title.toLowerCase()} services`,
                    });
                }

                const [existingBase] = await db.select().from(servicePosts).where(eq(servicePosts.slug, s.key)).limit(1);
                if (!existingBase) {
                    await db.insert(servicePosts).values({
                        slug: s.key,
                        title: s.title,
                        excerpt: s.description,
                        content: (() => { let out = `<h1>${s.title}</h1>`; for (let i = 1; i <= 6; i++) out += `<h2>Section ${i}</h2><p>${s.title} paragraph ${i} with practical advice and examples.</p>`; return out; })(),
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?.id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser.id,
                        statusId: publishedStatus.id,
                        meta_title: s.title,
                        meta_description: `Professional ${s.title.toLowerCase()} services`,
                    });
                }
            }
        }

        // Seed a few product samples tied to content category
        try {
            const productSamples = [
                {
                    slug: 'xtreme-save-18k',
                    title: 'Xtreme Save 1.5 Ton — Energy Efficient Inverter',
                    excerpt: 'High efficiency inverter AC with advanced filtration and smart features.',
                    content: '<p>High efficiency inverter AC with exceptional cooling and energy savings.</p>',
                    thumbnail: 'https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1400&q=80',
                    image_urls: ['https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1200&q=80'],
                    price: '85000.00',
                    compare_at_price: null,
                    currency: 'NRS',
                    inventory_status: 'in_stock',
                    model: 'MSAG-18HRFN1',
                    capacity: '18,000 BTU/h',
                    warranty: '2 years',
                    category_id: category?.id || null,
                    subcategory_id: subcategoryMap['seo'] || null,
                    statusId: publishedStatus.id,
                    featured: 1,
                    meta_title: 'Xtreme Save 1.5 Ton Inverter AC',
                    meta_description: 'Efficient inverter AC ideal for Nepali homes and small offices.',
                },
                {
                    slug: 'xtreme-save-24k',
                    title: 'Xtreme Save 2.0 Ton — Powerful Cooling',
                    excerpt: 'Robust performance for larger rooms and halls.',
                    content: '<p>Robust performance for larger rooms and halls.</p>',
                    thumbnail: 'https://images.unsplash.com/photo-1549399546-9d4d5f5d93d0?auto=format&fit=crop&w=1400&q=80',
                    image_urls: ['https://images.unsplash.com/photo-1549399546-9d4d5f5d93d0?auto=format&fit=crop&w=1200&q=80'],
                    price: '115000.00',
                    compare_at_price: null,
                    currency: 'NRS',
                    inventory_status: 'in_stock',
                    model: 'MSAG-24HRFN1',
                    capacity: '24,000 BTU/h',
                    warranty: '2 years',
                    category_id: category?.id || null,
                    subcategory_id: subcategoryMap['social'] || null,
                    statusId: publishedStatus.id,
                    featured: 0,
                    meta_title: 'Xtreme Save 2.0 Ton',
                    meta_description: 'Powerful cooling for larger rooms and small halls.',
                },

            ];

            for (const p of productSamples) {
                const payload: any = { ...p };
                delete payload.image_urls;
                const [existing] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
                if (existing && clean) {
                    try { await db.delete(productImages).where(eq(productImages.product_id, existing.id)); } catch (e) { }
                    try { await db.delete(products).where(eq(products.id, existing.id)); } catch (e) { }
                }
                if (!existing || clean) {
                    const result = await db.insert(products).values(payload as any);
                    const insertId = result?.[0]?.insertId;
                    if (insertId && Array.isArray(p.image_urls) && p.image_urls.length) {
                        const imageInserts = p.image_urls.map((url: string, idx: number) => ({ product_id: insertId, url, alt: p.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));
                        try { await db.insert(productImages).values(imageInserts); } catch (e) { logDbError(e, `insert product images ${p.slug}`); }
                    }
                }
            }
        } catch (e) { logDbError(e, 'seeding products'); }

        return NextResponse.json({ success: true, message: 'Services seeded successfully' }, { status: 201 });
    } catch (error) {
        logDbError(error, 'seeding services');
        return NextResponse.json({ error: 'Failed to seed services', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
