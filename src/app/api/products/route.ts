import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { Product, ProductImage } from '@/db/productsSchema';
import { getUserIdFromToken, returnRole } from '@/utils/authHelper';
import { isValidSlug } from '@/utils/slug';
import { revalidateTag } from 'next/cache';
import { ReviewTestimonials } from '@/db/reviewSchema';
import { ReviewTestimonialProducts } from '@/db/reviewTestimonialProductsSchema';
import mongoose from 'mongoose';

// GET - Fetch products
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const brand = searchParams.get('brand');
        const limit = searchParams.get('limit');
        const status = searchParams.get('status');
        const featured = searchParams.get('featured');
        const meta = searchParams.get('meta');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const smart = searchParams.get('smart');
        const filtration = searchParams.get('filtration');

        if (id) {
            // Try to find by ID first (ObjectId)
            let product = null;
            try {
                product = await Product.findById(id).lean();
            } catch (e) {
                // If not a valid ObjectId, it might be a slug
            }

            if (!product) {
                // treat `id` as a slug
                product = await Product.findOne({ slug: id }).lean();
            }

            if (product) {
                const images = await ProductImage.find({ product_id: product._id }).sort({ display_order: -1 }).lean();
                // normalize custom specs and features for easier consumption and provide nested `technical` for clients
                try {
                    const parsed = product.customSpecs || (product.custom_specs ? (typeof product.custom_specs === 'string' ? JSON.parse(product.custom_specs) : product.custom_specs) : []);
                    (product as any).customSpecs = parsed;
                    // parse features if present
                    try { (product as any).features = product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : []; } catch (er) { (product as any).features = []; }
                    (product as any).technical = {
                        power: product.power || null,
                        iseer: product.iseer || null,
                        refrigerant: product.refrigerant || null,
                        noise: product.noise || null,
                        dimensions: product.dimensions || null,
                        voltage: product.voltage || null,
                        capacity: product.capacity || null,
                        warranty: product.warranty || null,
                        customSpecs: parsed
                    };
                } catch (e) { (product as any).customSpecs = []; (product as any).technical = (product as any).technical || { customSpecs: [] }; }

                // attach category/subcategory objects when available
                try {
                    const { ServiceCategories, ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                    if (product.category_id) {
                        const cat = await ServiceCategories.findById(product.category_id).lean();
                        if (cat) (product as any).category = { id: cat._id.toString(), name: cat.name, slug: cat.slug };
                    }
                    if (product.subcategory_id) {
                        const sub = await ServiceSubcategories.findById(product.subcategory_id).lean();
                        if (sub) (product as any).subcategory = { id: sub._id.toString(), name: sub.name, slug: sub.slug };
                    }
                } catch (e) {
                    // ignore if category schema missing
                }

                // compute reviews and rating from testimonials if available
                try {
                    const reviewMappings = await ReviewTestimonialProducts.find({ productId: product._id }).lean();
                    const testimonialIds = reviewMappings.map(m => m.testimonialId);
                    const testimonials = await ReviewTestimonials.find({ _id: { $in: testimonialIds } }).lean();

                    const reviews_count = testimonials.length;
                    const rating = reviews_count ? testimonials.reduce((s: number, t: any) => s + Number(t.rating || 0), 0) / reviews_count : 0;

                    // compute star breakdown counts
                    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    testimonials.forEach((t: any) => {
                        const r = Number(t.rating || 0);
                        if (r >= 1 && r <= 5) breakdown[r] = (breakdown[r] || 0) + 1;
                    });

                    return NextResponse.json({
                        ...product,
                        id: product._id.toString(),
                        price: product.price ? product.price.toString() : null,
                        compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : null,
                        images,
                        rating: Number(rating.toFixed(1)),
                        reviews_count,
                        reviews_breakdown: breakdown
                    });
                } catch (e) {
                    return NextResponse.json({
                        ...product,
                        id: product._id.toString(),
                        price: product.price ? product.price.toString() : null,
                        compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : null,
                        images
                    });
                }
            }

            // NOTE: Removed fallback to ServicePosts (returning a service as a product) per project policy

            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (slug) {
            const product = await Product.findOne({ slug }).lean();
            if (product) {
                const images = await ProductImage.find({ product_id: product._id }).sort({ display_order: -1 }).lean();
                // normalize custom specs and features for easier consumption and provide nested `technical` for clients
                try {
                    const parsed = product.customSpecs || (product.custom_specs ? (typeof product.custom_specs === 'string' ? JSON.parse(product.custom_specs) : product.custom_specs) : []);
                    (product as any).customSpecs = parsed;
                    // parse features if present
                    try { (product as any).features = product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : []; } catch (er) { (product as any).features = []; }
                    (product as any).technical = {
                        power: product.power || null,
                        iseer: product.iseer || null,
                        refrigerant: product.refrigerant || null,
                        noise: product.noise || null,
                        dimensions: product.dimensions || null,
                        voltage: product.voltage || null,
                        capacity: product.capacity || null,
                        warranty: product.warranty || null,
                        customSpecs: parsed
                    };
                } catch (e) { (product as any).customSpecs = []; (product as any).technical = (product as any).technical || { customSpecs: [] }; }

                // attach category/subcategory objects when available
                try {
                    const { ServiceCategories, ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                    if (product.category_id) {
                        const cat = await ServiceCategories.findById(product.category_id).lean();
                        if (cat) (product as any).category = { id: cat._id.toString(), name: cat.name, slug: cat.slug };
                    }
                    if (product.subcategory_id) {
                        const sub = await ServiceSubcategories.findById(product.subcategory_id).lean();
                        if (sub) (product as any).subcategory = { id: sub._id.toString(), name: sub.name, slug: sub.slug };
                    }
                } catch (e) {
                    // ignore if category schema missing
                }

                // compute reviews and rating from testimonials if available
                try {
                    const reviewMappings = await ReviewTestimonialProducts.find({ productId: product._id }).lean();
                    const testimonialIds = reviewMappings.map(m => m.testimonialId);
                    const testimonials = await ReviewTestimonials.find({ _id: { $in: testimonialIds } }).lean();

                    const reviews_count = testimonials.length;
                    const rating = reviews_count ? testimonials.reduce((s: number, t: any) => s + Number(t.rating || 0), 0) / reviews_count : 0;

                    // compute star breakdown counts
                    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    testimonials.forEach((t: any) => {
                        const r = Number(t.rating || 0);
                        if (r >= 1 && r <= 5) breakdown[r] = (breakdown[r] || 0) + 1;
                    });

                    return NextResponse.json({
                        ...product,
                        id: product._id.toString(),
                        price: product.price ? product.price.toString() : null,
                        compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : null,
                        images,
                        rating: Number(rating.toFixed(1)),
                        reviews_count,
                        reviews_breakdown: breakdown
                    });
                } catch (e) {
                    return NextResponse.json({
                        ...product,
                        id: product._id.toString(),
                        price: product.price ? product.price.toString() : null,
                        compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : null,
                        images
                    });
                }
            }

            // NOTE: Removed fallback to ServicePosts (returning a service as a product) per project policy

            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let query: any = {};

        // Support fetching by explicit ids list: ?ids=1,2,3 or ?ids=hexid1,hexid2
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            // Split tokens; accept numeric ids and string ObjectId-like ids
            const parts = String(idsParam).split(',').map(s => s.trim()).filter(Boolean);
            if (!parts.length) return NextResponse.json([]);

            query._id = { $in: parts };
        }

        if (status) {
            if (status === 'in_stock' || status === 'out_of_stock' || status === 'in-stock' || status === 'out-of-stock') {
                query.inventory_status = status.replace('-', '_');
            } else if (!isNaN(parseInt(status))) {
                query.statusId = parseInt(status);
            }
        }

        if (featured === '1' || featured === 'true') {
            query.featured = 1;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice && !isNaN(parseFloat(minPrice))) query.price.$gte = parseFloat(minPrice);
            if (maxPrice && !isNaN(parseFloat(maxPrice))) query.price.$lte = parseFloat(maxPrice);
            if (Object.keys(query.price).length === 0) delete query.price;
        }

        if (smart === '1' || smart === 'true') query.smart = 1;
        if (filtration === '1' || filtration === 'true') query.filtration = 1;

        if (category) {
            // Try to use category as ID first, then as slug, and then as a brand name
            try {
                const { ServiceCategories } = await import('@/db/serviceCategoriesSchema');
                let cat = null;
                try {
                    cat = await ServiceCategories.findById(category).lean();
                } catch (e) { }

                if (!cat) {
                    cat = await ServiceCategories.findOne({ slug: category }).lean();
                }

                if (cat) {
                    // Include products directly in this category OR in any of its subcategories
                    try {
                        const { ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                        const subs = await ServiceSubcategories.find({ category_id: cat._id }).lean();
                        const subIds = subs.map((s: any) => s._id);
                        query.$or = [
                            { category_id: cat._id },
                            { subcategory_id: { $in: subIds } }
                        ];
                    } catch (e) {
                        query.category_id = cat._id;
                    }
                } else {
                    // Fallback: see if "category" is actually a brand name (case-insensitive)
                    const brandCats = await ServiceCategories.find({
                        brand: { $regex: new RegExp(`^${category}$`, 'i') }
                    }).lean();
                    const catIds = brandCats.map((c: any) => c._id).filter(Boolean);
                    if (catIds.length) {
                        query.category_id = { $in: catIds };
                    } else {
                        // If category/brand not found, force empty result by providing a non-existent ID
                        query._id = new mongoose.Types.ObjectId();
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        // If brand parameter is provided, restrict products to categories tagged with that brand or global categories.
        // Also support when `brand` is actually a category slug or ObjectId: in that case return products only for that category.
        if (brand) {
            const { ServiceCategories } = await import('@/db/serviceCategoriesSchema');

            // Try interpreting `brand` as a category id first, then as a slug
            let matchedCat = null;
            try {
                matchedCat = await ServiceCategories.findById(brand).lean();
            } catch (e) { }

            if (!matchedCat) {
                matchedCat = await ServiceCategories.findOne({ slug: brand }).lean();
            }

            if (matchedCat) {
                // `brand` refers to a specific category -> restrict to that single category and its subcategories
                try {
                    const { ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                    const subs = await ServiceSubcategories.find({ category_id: matchedCat._id }).lean();
                    const subIds = subs.map((s: any) => s._id);
                    query.$or = [
                        { category_id: matchedCat._id },
                        { subcategory_id: { $in: subIds } }
                    ];
                } catch (e) {
                    query.category_id = matchedCat._id;
                }
            } else {
                // Fallback: find categories that are tagged with this brand, or global categories (brand = '')
                const brandCats = await ServiceCategories.find({
                    $or: [
                        { brand: brand },
                        { brand: '' }
                    ]
                }).lean();
                const catIds = brandCats.map((c: any) => c._id).filter(Boolean);
                if (catIds.length) {
                    query.category_id = { $in: catIds };
                } else {
                    // If no categories for brand, return empty set
                    return NextResponse.json([]);
                }
            }
        }

        if (subcategory) {
            try {
                const { ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                let sub = null;
                try {
                    sub = await ServiceSubcategories.findById(subcategory).lean();
                } catch (e) { }

                if (!sub) {
                    // Try exact slug
                    sub = await ServiceSubcategories.findOne({ slug: subcategory }).lean();
                }

                if (!sub && category) {
                    // Try category-prefixed slug (e.g. midea-split)
                    sub = await ServiceSubcategories.findOne({ slug: `${category}-${subcategory}` }).lean();
                }

                if (sub) {
                    query.subcategory_id = sub._id;
                }
            } catch (e) {
                // ignore
            }
        }

        // Server-side free-text search (q): title, slug, excerpt, model, content
        const qParam = searchParams.get('q');
        if (qParam) {
            const pattern = new RegExp(qParam, 'i');
            query.$or = [
                { title: pattern },
                { slug: pattern },
                { excerpt: pattern },
                { model: pattern },
                { content: pattern }
            ];
        }

        const offset = searchParams.get('offset');
        const offsetNum = offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0;

        const sortParam = searchParams.get('sort');
        let sort: any = { createdAt: -1 };

        if (sortParam === 'price_asc') sort = { price: 1 };
        else if (sortParam === 'price_desc') sort = { price: -1 };
        else if (sortParam === 'capacity_asc') sort = { capacity: 1 };
        else if (sortParam === 'capacity_desc') sort = { capacity: -1 };
        else if (sortParam === 'featured') sort = { featured: -1, createdAt: -1 };

        let productQuery = Product.find(query).sort(sort).skip(offsetNum);
        if (limit && !isNaN(parseInt(limit))) {
            productQuery = productQuery.limit(parseInt(limit));
        }

        const rows = await productQuery.lean();

        // attach category / subcategory objects for list responses
        try {
            const catIds = Array.from(new Set(rows.map((r: any) => r.category_id).filter(Boolean)));
            const subIds = Array.from(new Set(rows.map((r: any) => r.subcategory_id).filter(Boolean)));
            if (catIds.length || subIds.length) {
                const { ServiceCategories, ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                const cats = catIds.length ? await ServiceCategories.find({ _id: { $in: catIds } }).lean() : [];
                const subs = subIds.length ? await ServiceSubcategories.find({ _id: { $in: subIds } }).lean() : [];
                const catMap: Record<string, any> = {};
                const subMap: Record<string, any> = {};
                cats.forEach((c: any) => { catMap[String(c._id)] = { id: c._id, name: c.name, slug: c.slug }; });
                subs.forEach((s: any) => { subMap[String(s._id)] = { id: s._id, name: s.name, slug: s.slug }; });
                rows.forEach((r: any) => {
                    if (r.category_id && catMap[String(r.category_id)]) r.category = catMap[String(r.category_id)];
                    if (r.subcategory_id && subMap[String(r.subcategory_id)]) r.subcategory = subMap[String(r.subcategory_id)];
                });
            }
        } catch (e) {
            // ignore if categories schema missing
        }

        // attach aggregated reviews info for listed products
        try {
            const ids = rows.map((r: any) => r._id).filter((id: any) => !!id);
            if (ids.length) {
                const reviewMappings = await ReviewTestimonialProducts.find({ productId: { $in: ids } }).lean();
                const testimonialIds = reviewMappings.map((m: any) => m.testimonialId);
                const testimonials = await ReviewTestimonials.find({ _id: { $in: testimonialIds } }).lean();

                // Create a mapping of productId to testimonials
                const productTestimonials: Record<string, any[]> = {};
                reviewMappings.forEach((mapping: any) => {
                    const pid = String(mapping.productId);
                    if (!productTestimonials[pid]) productTestimonials[pid] = [];
                    const testimonial = testimonials.find((t: any) => String(t._id) === String(mapping.testimonialId));
                    if (testimonial) productTestimonials[pid].push(testimonial);
                });

                const agg: Record<string, { count: number, sum: number, breakdown: Record<number, number> }> = {};
                Object.keys(productTestimonials).forEach(pid => {
                    agg[pid] = { count: 0, sum: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
                    productTestimonials[pid].forEach((t: any) => {
                        const r = Number(t?.rating || 0);
                        if (r >= 1 && r <= 5) {
                            agg[pid].count += 1;
                            agg[pid].sum += r;
                            agg[pid].breakdown[r] = (agg[pid].breakdown[r] || 0) + 1;
                        }
                    });
                });

                // attach aggregates to rows
                rows.forEach((r: any) => {
                    const a = agg[String(r._id)];
                    if (a) {
                        r.reviews_count = a.count;
                        r.rating = a.count ? Number((a.sum / a.count).toFixed(1)) : 0;
                        r.reviews_breakdown = a.breakdown;
                    }
                });
            }
        } catch (e) {
            // ignore aggregation errors
        }

        const formattedRows = rows.map((r: any) => ({
            ...r,
            id: r._id.toString(),
            price: r.price ? r.price.toString() : null,
            compare_at_price: r.compare_at_price ? r.compare_at_price.toString() : null,
            discount_percent: r.discount_percent ?? 0,
            discounted_price: r.discounted_price ? (r.discounted_price.toString ? r.discounted_price.toString() : String(r.discounted_price)) : null
        }));

        // If client requested meta information with pagination, include total count
        if (limit && meta === 'true') {
            const total = await Product.countDocuments(query);
            return NextResponse.json({ products: formattedRows, total });
        }

        return NextResponse.json(formattedRows);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create product
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('admin_auth')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
        const authorId = getUserIdFromToken(token);
        if (!authorId) return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });

        const body = await request.json();
        const {
            slug,
            title,
            excerpt,
            content,
            thumbnail,
            price,
            compare_at_price,
            currency,
            statusId,
            category_id,
            subcategory_id,
            model,
            capacity,
            warranty,
            inventory_status,
            rating,
            metaTitle,
            metaDescription,
            images,
            // new/extended fields
            energy_saving,
            smart,
            filtration,
            brochure_url,
            power,
            iseer,
            refrigerant,
            noise,
            dimensions,
            voltage,
            locations,
            application_areas,
            availabilityLabel,
            // key features (array)
            features,
            // technical enabled flag (accept both variants) -- normalized below
        } = body;
        // Normalize technical flag: accept camelCase or snake_case from incoming body
        const technicalEnabledNormalized = typeof body.technicalEnabled !== 'undefined' ? body.technicalEnabled : (typeof body.technical_enabled !== 'undefined' ? body.technical_enabled : undefined);

        // Log incoming technical flag for debugging
        console.log('Creating product, technicalEnabled (normalized):', (typeof body.technicalEnabled !== 'undefined' ? body.technicalEnabled : body.technical_enabled));

        // Require slug and validate
        if (!slug || !title) return NextResponse.json({ error: 'Required fields: slug, title' }, { status: 400 });
        if (!isValidSlug(slug)) return NextResponse.json({ error: 'Invalid slug. Use only letters, numbers, hyphens and underscores.' }, { status: 400 });

        const productData: any = {
            slug,
            title,
            excerpt: excerpt || '',
            content: content || null,
            thumbnail: thumbnail || null,
            price: (typeof price !== 'undefined' && price !== null && price !== '') ? price : null,
            compare_at_price: (typeof compare_at_price !== 'undefined' && compare_at_price !== null && compare_at_price !== '') ? compare_at_price : null,
            currency: currency || 'NPR',
            statusId,
            category_id: category_id || null,
            subcategory_id: subcategory_id || null,
            model: model || null,
            capacity: capacity || null,
            warranty: warranty || null,
            energy_saving: energy_saving || null,
            smart: smart ? 1 : 0,
            filtration: filtration ? 1 : 0,
            brochure_url: brochure_url || null,
            power: power || null,
            iseer: iseer || null,
            refrigerant: refrigerant || null,
            noise: noise || null,
            dimensions: dimensions || null,
            voltage: voltage || null,
            locations: locations ? (typeof locations === 'string' ? locations : JSON.stringify(locations)) : null,
            application_areas: application_areas ? (typeof application_areas === 'string' ? application_areas : JSON.stringify(application_areas)) : null,
            availabilityLabel: typeof availabilityLabel !== 'undefined' ? availabilityLabel : undefined,
            inventory_status: inventory_status || 'in_stock',
            rating: (typeof rating !== 'undefined' && rating !== null && rating !== '') ? rating : '0',
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
            technical_enabled: typeof technicalEnabledNormalized !== 'undefined' ? (technicalEnabledNormalized ? 1 : 0) : 1,
            // accept key features (array) and persist them as JSON string
            features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : '[]',
            // accept custom specs (camelCase or snake_case), store as JSON string
            custom_specs: (typeof body.customSpecs !== 'undefined') ? (Array.isArray(body.customSpecs) ? JSON.stringify(body.customSpecs) : (typeof body.customSpecs === 'string' ? body.customSpecs : JSON.stringify(body.customSpecs))) : (typeof body.custom_specs !== 'undefined' ? (typeof body.custom_specs === 'string' ? body.custom_specs : JSON.stringify(body.custom_specs)) : '[]'),
            // discount fields
            discount_percent: (typeof body.discount_percent !== 'undefined' && body.discount_percent !== null && body.discount_percent !== '') ? Number(body.discount_percent) : 0,
        };

        // compute discounted price from compare_at_price when discount provided
        try {
            const disc = (typeof body.discount_percent !== 'undefined' && body.discount_percent !== null && body.discount_percent !== '') ? Number(body.discount_percent) : 0;
            if (productData.compare_at_price && disc > 0) {
                const base = Number(productData.compare_at_price);
                const discounted = Number((base * (1 - (disc / 100))).toFixed(2));
                productData.discounted_price = discounted;
                productData.price = discounted;
            } else {
                productData.discounted_price = null;
            }
        } catch (e) { productData.discounted_price = null; }

        const newProduct = await Product.create(productData);
        const insertId = newProduct._id;

        if (images && Array.isArray(images) && insertId) {
            const imageInserts = images.map((img: any) => ({
                product_id: insertId,
                url: img.url,
                alt: img.alt || '',
                is_primary: img.is_primary ? 1 : 0,
                display_order: img.display_order ? img.display_order : 0,
            }));
            try {
                await ProductImage.insertMany(imageInserts);
            } catch (err) {
                // ignore image insert failures but log
                console.error('Failed to insert product images:', err);
            }
        }

        try { revalidateTag('products', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Product created successfully', id: insertId.toString() }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A product with this slug already exists. Please use a different slug.' }, { status: 409 });
        }
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: 'Invalid category or subcategory ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('admin_auth')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
        const authorId = getUserIdFromToken(token);
        if (!authorId) return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });

        const body = await request.json();
        const {
            id,
            slug,
            title,
            excerpt,
            content,
            thumbnail,
            price,
            compare_at_price,
            currency,
            statusId,
            category_id,
            subcategory_id,
            model,
            capacity,
            warranty,
            inventory_status,
            rating,
            metaTitle,
            metaDescription,
            images,
            // new fields
            energy_saving,
            smart,
            filtration,
            brochure_url,
            power,
            iseer,
            refrigerant,
            noise,
            dimensions,
            voltage,
            locations,
            application_areas,
            availabilityLabel,
            // technical enabled flag
            technicalEnabled,
            // key features (array)
            features,
        } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (slug !== undefined) {
            if (!isValidSlug(slug)) return NextResponse.json({ error: 'Invalid slug. Use only letters, numbers, hyphens and underscores.' }, { status: 400 });
            updateData.slug = slug;
        }
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (price !== undefined) updateData.price = (price === '' ? null : price);
        if (compare_at_price !== undefined) updateData.compare_at_price = (compare_at_price === '' ? null : compare_at_price);
        if (typeof body.discount_percent !== 'undefined') {
            const d = (body.discount_percent === '' || body.discount_percent === null) ? 0 : Number(body.discount_percent);
            updateData.discount_percent = isNaN(d) ? 0 : d;
            // compute discounted price when both compare_at_price and discount available
            try {
                const base = (typeof updateData.compare_at_price !== 'undefined' && updateData.compare_at_price !== null && updateData.compare_at_price !== '') ? Number(updateData.compare_at_price) : (typeof compare_at_price !== 'undefined' ? (compare_at_price === '' ? null : Number(compare_at_price)) : undefined);
                if (base && updateData.discount_percent > 0) {
                    const discounted = Number((base * (1 - (updateData.discount_percent / 100))).toFixed(2));
                    updateData.discounted_price = discounted;
                    updateData.price = discounted;
                } else {
                    updateData.discounted_price = null;
                }
            } catch (e) { updateData.discounted_price = null; }
        }
        if (currency !== undefined) updateData.currency = currency;
        if (statusId !== undefined) updateData.statusId = statusId;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id;
        if (model !== undefined) updateData.model = model;
        if (capacity !== undefined) updateData.capacity = capacity;
        if (warranty !== undefined) updateData.warranty = warranty;
        if (energy_saving !== undefined) updateData.energy_saving = energy_saving;
        if (smart !== undefined) updateData.smart = smart ? 1 : 0;
        if (filtration !== undefined) updateData.filtration = filtration ? 1 : 0;
        if (brochure_url !== undefined) updateData.brochure_url = brochure_url;
        if (power !== undefined) updateData.power = power;
        if (iseer !== undefined) updateData.iseer = iseer;
        if (refrigerant !== undefined) updateData.refrigerant = refrigerant;
        if (noise !== undefined) updateData.noise = noise;
        if (dimensions !== undefined) updateData.dimensions = dimensions;
        if (voltage !== undefined) updateData.voltage = voltage;
        if (locations !== undefined) updateData.locations = typeof locations === 'string' ? locations : JSON.stringify(locations);
        if (application_areas !== undefined) updateData.application_areas = typeof application_areas === 'string' ? application_areas : JSON.stringify(application_areas);
        if (availabilityLabel !== undefined) updateData.availabilityLabel = availabilityLabel;
        if (inventory_status !== undefined) updateData.inventory_status = inventory_status;
        if (rating !== undefined) updateData.rating = (rating === '' ? '0' : rating);
        if (metaTitle !== undefined) updateData.meta_title = metaTitle;
        if (metaDescription !== undefined) updateData.meta_description = metaDescription;
        // accept key features updates
        if (typeof features !== 'undefined') {
            if (features === null) updateData.features = '[]';
            else if (Array.isArray(features)) updateData.features = JSON.stringify(features);
            else updateData.features = (typeof features === 'string') ? features : JSON.stringify(features);
        }
        // accept custom specs updates (camelCase or snake_case)
        const customSpecsIncoming = (typeof body.customSpecs !== 'undefined') ? body.customSpecs : (typeof body.custom_specs !== 'undefined' ? body.custom_specs : undefined);
        if (typeof customSpecsIncoming !== 'undefined') {
            if (customSpecsIncoming === null) updateData.custom_specs = '[]';
            else if (Array.isArray(customSpecsIncoming)) updateData.custom_specs = JSON.stringify(customSpecsIncoming);
            else updateData.custom_specs = (typeof customSpecsIncoming === 'string') ? customSpecsIncoming : JSON.stringify(customSpecsIncoming);
        }
        // accept either camelCase or snake_case in updates
        const technicalEnabledIncoming = (typeof body.technicalEnabled !== 'undefined') ? body.technicalEnabled : (typeof body.technical_enabled !== 'undefined' ? body.technical_enabled : undefined);
        if (typeof technicalEnabledIncoming !== 'undefined') {
            updateData.technical_enabled = technicalEnabledIncoming ? 1 : 0;
            console.log('Updating product technical_enabled to', updateData.technical_enabled, 'for id', id);
        }

        await Product.findByIdAndUpdate(id, updateData, { new: true });

        // If compare_at_price changed but discount_percent not provided, recompute discounted_price using existing discount_percent
        try {
            if (typeof compare_at_price !== 'undefined' && (typeof body.discount_percent === 'undefined')) {
                const db = await Product.findById(id).lean();
                if (db && db.discount_percent && db.compare_at_price) {
                    const base = Number(compare_at_price === '' ? db.compare_at_price : compare_at_price);
                    const discounted = Number((base * (1 - (Number(db.discount_percent) / 100))).toFixed(2));
                    await Product.findByIdAndUpdate(id, { discounted_price: discounted, price: discounted });
                }
            }
        } catch (e) { /* ignore */ }

        // handle images - if images array provided, replace existing images
        if (images && Array.isArray(images)) {
            try {
                await ProductImage.deleteMany({ product_id: id });
                const imageInserts = images.map((img: any) => ({
                    product_id: id,
                    url: img.url,
                    alt: img.alt || '',
                    is_primary: img.is_primary ? 1 : 0,
                    display_order: img.display_order ? img.display_order : 0,
                }));
                if (imageInserts.length) await ProductImage.insertMany(imageInserts);
            } catch (err) {
                console.error('Failed to replace product images:', err);
            }
        }

        try { revalidateTag('products', 'max'); } catch (e) { /* ignore */ }
        try { revalidateTag(`product-${id}`, 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('admin_auth')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized - missing token' }, { status: 401 });
        const userId = getUserIdFromToken(token);
        if (!userId) return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        let id = searchParams.get('id');
        let slug = searchParams.get('slug');

        if (!id && !slug) {
            try {
                const body = await request.json();
                if (body && (body.id || body.slug)) {
                    id = body.id ? String(body.id) : undefined as any;
                    slug = body.slug ? String(body.slug) : undefined as any;
                }
            } catch (err) {
                // ignore JSON parse errors
            }
        }

        if (!id && !slug) return NextResponse.json({ error: 'ID or slug is required' }, { status: 400 });

        let productId = id ? id : null;
        if (!productId && slug) {
            const product = await Product.findOne({ slug }).lean();
            if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            productId = String(product._id);
        }

        if (!productId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const existing = await Product.findById(productId).lean();
        if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        try {
            await ProductImage.deleteMany({ product_id: productId });
        } catch (err) {
            // ignore
        }

        try {
            await Product.findByIdAndDelete(productId);
        } catch (err: any) {
            console.error('Deletion failed:', err);
            return NextResponse.json({ error: 'Failed to delete product', details: err.message || String(err) }, { status: 500 });
        }

        try { revalidateTag('products', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
