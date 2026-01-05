import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    ServicesPageHero,
    ServicesPageDetails,
    ServicesPageProcessSection,
    ServicesPageProcessSteps,
    ServicesPageCTA,
    ServicesPageFeatures,
    ServicesPageBrands,
    ServicesPageTrust,
} from '@/db/servicesPageSchema';
import { Product, ProductImage } from '@/db/productsSchema';
import { ServicePosts } from '@/db/servicePostsSchema';
import { ServiceCategories, ServiceSubcategories } from '@/db/serviceCategoriesSchema';
import { ReviewTestimonials } from '@/db/reviewSchema';
import { ShopPageHero } from '@/db/shopPageSchema';
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
    // hoist some vars to function scope to avoid block-scope issues
    let firstUser: any = null;
    let publishedStatus: any = null;
    let clean = false;
    let brandParam: string | null = null;

    try {
        await connectDB();

        const reqUrl = new URL(request.url);
        brandParam = reqUrl.searchParams.get('brand');
        clean = reqUrl.searchParams.get('clean') === '1' || reqUrl.searchParams.get('clean') === 'true';

        firstUser = await User.findOne().lean();
        const statusRows = await Status.find().lean();
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
            const existingBrand = await ServiceCategories.findOne({ slug: b.slug }).lean();
            let brandId: any = null;
            if (!existingBrand) {
                const res = await ServiceCategories.create({
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
                brandId = res._id;
            } else {
                brandId = existingBrand._id;
                await ServiceCategories.findByIdAndUpdate(existingBrand._id, { brand: b.slug });
            }

            // Seed subcategories for the brand
            for (const t of acTypes) {
                const subSlug = `${b.slug}-${t.slug}`;
                const existingSub = await ServiceSubcategories.findOne({ slug: subSlug }).lean();
                if (!existingSub) {
                    await ServiceSubcategories.create({
                        category_id: brandId,
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
                        await Product.deleteMany({ subcategory_id: existingSub._id });
                    } catch (e) { /* ignore */ }
                }

                // Insert 1-2 sample products per brand/subcategory (idempotent)
                try {
                    const sub = await ServiceSubcategories.findOne({ slug: subSlug }).lean();
                    for (let i = 1; i <= 2; i++) {
                        const pslug = `${b.slug}-${t.slug}-sample-${i}`;
                        const existingProd = await Product.findOne({ slug: pslug }).lean();
                        if (existingProd && !clean) continue;
                        if (existingProd && clean) {
                            try { await ProductImage.deleteMany({ product_id: existingProd._id }); } catch (e) { }
                            try { await Product.findByIdAndDelete(existingProd._id); } catch (e) { }
                        }

                        const title = `${b.name} ${t.name} ${i}`;
                        const res = await Product.create({
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
                            subcategory_id: sub?._id || null,
                            statusId: publishedStatus._id,
                            featured: i === 1 ? 1 : 0,
                            meta_title: title,
                            meta_description: `Seeded ${b.name} ${t.name}`,
                        });

                        const insertId = res._id;
                        if (insertId) {
                            try {
                                await ProductImage.create({
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
            const shopHero = await ShopPageHero.findOne().lean();
            if (!shopHero) {
                await ShopPageHero.create({
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

        // Seed a brand-specific hero for Midea if missing
        try {
            const { ShopPageBrandHero } = await import('@/db/shopPageSchema');
            const mideaHero = await ShopPageBrandHero.findOne({ brand_slug: 'midea' }).lean();
            if (!mideaHero) {
                await ShopPageBrandHero.create({
                    brand_slug: 'midea',
                    badge_text: 'Official Midea Distributor',
                    title: 'Midea Xtreme Series',
                    subtitle: 'Energy-efficient Midea air conditioners optimized for local conditions.',
                    cta_text: 'Explore Midea Series',
                    cta_link: '/midea-ac',
                    background_image: 'https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1400&q=80',
                    hero_image_alt: 'Midea showroom',
                    is_active: 1,
                });
            }
        } catch (e) { /* non-fatal */ }

        // Seed additional static content if missing (idempotent checks)
        const heroExists = await ServicesPageHero.findOne().lean();
        if (!heroExists) {
            await ServicesPageHero.create({
                tagline: 'OUR SERVICES',
                title: 'Quality Air Conditioners & Parts',
                description: 'Explore a wide range of AC units, parts, and installation services from trusted brands.',
                badge_text: 'Free Installation Offer',

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
        let contentCat = await ServiceCategories.findOne({ slug: contentSlug }).lean();
        if (!contentCat) {
            await ServiceCategories.create({
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

        const category = await ServiceCategories.findOne({ slug: contentSlug }).lean();

        const serviceData = [
            { key: 'seo', icon: 'search', title: 'SEO', description: 'Search-optimized articles and landing pages.', bullets: ['Keyword research', 'On-page SEO', 'Long-form content'], image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80', image_alt: 'Content strategist reviewing SEO metrics on a laptop' },
            { key: 'social', icon: 'thumb_up', title: 'Social', description: 'Platform posts and short-form video content.', bullets: ['Content calendars', 'Short video hooks', 'Design kits'], image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80', image_alt: 'Team planning social content with phones and laptops' },
            { key: 'copy', icon: 'language', title: 'Copy', description: 'Conversion-focused website copy and microcopy.', bullets: ['Value prop', 'Landing pages', 'Microcopy'], image: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80', image_alt: 'Copywriter drafting website copy next to design mockups' },
        ];

        const subcategoryMap: Record<string, any> = {};
        for (const [index, s] of serviceData.entries()) {
            const existingSub = await ServiceSubcategories.findOne({ slug: s.key }).lean();
            if (!existingSub) {
                await ServiceSubcategories.create({
                    category_id: category?._id,
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
                const subcat = await ServiceSubcategories.findOne({ slug: s.key }).lean();
                if (subcat?._id) subcategoryMap[s.key] = subcat._id;
            } else {
                subcategoryMap[s.key] = existingSub._id;
            }
        }

        for (const [index, s] of serviceData.entries()) {
            const existingDetail = await ServicesPageDetails.findOne({ key: s.key }).lean();
            if (!existingDetail) {
                await ServicesPageDetails.create({
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

                const existingPost = await ServicePosts.findOne({ slug: `${s.key}-guide` }).lean();
                if (!existingPost) {
                    await ServicePosts.create({
                        slug: `${s.key}-guide`,
                        title: `${s.title} — guide`,
                        excerpt: s.description,
                        content: variantContent,
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?._id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser._id,
                        statusId: publishedStatus._id,
                        meta_title: `${s.title} — guide`,
                        meta_description: `Professional ${s.title.toLowerCase()} services`,
                    });
                }

                const existingBase = await ServicePosts.findOne({ slug: s.key }).lean();
                if (!existingBase) {
                    await ServicePosts.create({
                        slug: s.key,
                        title: s.title,
                        excerpt: s.description,
                        content: (() => { let out = `<h1>${s.title}</h1>`; for (let i = 1; i <= 6; i++) out += `<h2>Section ${i}</h2><p>${s.title} paragraph ${i} with practical advice and examples.</p>`; return out; })(),
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?._id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser._id,
                        statusId: publishedStatus._id,
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
                    category_id: category?._id || null,
                    subcategory_id: subcategoryMap['seo'] || null,
                    statusId: publishedStatus._id,
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
                    category_id: category?._id || null,
                    subcategory_id: subcategoryMap['social'] || null,
                    statusId: publishedStatus._id,
                    featured: 0,
                    meta_title: 'Xtreme Save 2.0 Ton',
                    meta_description: 'Powerful cooling for larger rooms and small halls.',
                },

            ];

            for (const p of productSamples) {
                const payload: any = { ...p };
                delete payload.image_urls;
                const existing = await Product.findOne({ slug: p.slug }).lean();
                if (existing && clean) {
                    try { await ProductImage.deleteMany({ product_id: existing._id }); } catch (e) { }
                    try { await Product.findByIdAndDelete(existing._id); } catch (e) { }
                }
                if (!existing || clean) {
                    const result = await Product.create(payload as any);
                    const insertId = result._id;
                    if (insertId && Array.isArray(p.image_urls) && p.image_urls.length) {
                        const imageInserts = p.image_urls.map((url: string, idx: number) => ({ product_id: insertId, url, alt: p.title || '', is_primary: idx === 0 ? 1 : 0, display_order: idx }));
                        try { await ProductImage.create(imageInserts); } catch (e) { logDbError(e, `insert product images ${p.slug}`); }
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
