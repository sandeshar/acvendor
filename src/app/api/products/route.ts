import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { products, productImages } from '@/db/productsSchema';
import { getUserIdFromToken, returnRole } from '@/utils/authHelper';
import { revalidateTag } from 'next/cache';

// GET - Fetch products
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const limit = searchParams.get('limit');
        const status = searchParams.get('status');

        if (id) {
            // Accept numeric IDs or slugs passed in the `id` parameter
            const idNum = parseInt(id);
            if (!isNaN(idNum)) {
                const rows = await db.select().from(products).where(eq(products.id, idNum)).limit(1);
                if (rows && rows.length) {
                    const product = rows[0];
                    const images = await db.select().from(productImages).where(eq(productImages.product_id, product.id)).orderBy(desc(productImages.display_order));
                    return NextResponse.json({ ...product, images });
                }
            } else {
                // treat `id` as a slug
                const rows = await db.select().from(products).where(eq(products.slug, id)).limit(1);
                if (rows && rows.length) {
                    const product = rows[0];
                    const images = await db.select().from(productImages).where(eq(productImages.product_id, product.id)).orderBy(desc(productImages.display_order));
                    return NextResponse.json({ ...product, images });
                }

                // Fallback: check servicePosts by slug
                try {
                    const { servicePosts } = await import('@/db/servicePostsSchema');
                    const spRows = await db.select().from(servicePosts).where(eq(servicePosts.slug, id)).limit(1);
                    if (spRows && spRows.length) return NextResponse.json(spRows[0]);
                } catch (e) {
                    // ignore
                }
            }

            // Fallback: check servicePosts table by numeric ID if we had a numeric id but it wasn't found
            try {
                const { servicePosts } = await import('@/db/servicePostsSchema');
                const spRows = await db.select().from(servicePosts).where(eq(servicePosts.id, isNaN(idNum) ? -1 : idNum)).limit(1);
                if (spRows && spRows.length) return NextResponse.json(spRows[0]);
            } catch (e) {
                // ignore if servicePosts schema not present
            }

            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (slug) {
            const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
            if (rows && rows.length) {
                const product = rows[0];
                const images = await db.select().from(productImages).where(eq(productImages.product_id, product.id)).orderBy(desc(productImages.display_order));
                return NextResponse.json({ ...product, images });
            }

            // Fallback to service posts (legacy services table)
            try {
                const { servicePosts } = await import('@/db/servicePostsSchema');
                const spRows = await db.select().from(servicePosts).where(eq(servicePosts.slug, slug)).limit(1);
                if (spRows && spRows.length) return NextResponse.json(spRows[0]);
            } catch (e) {
                // ignore if not available
            }

            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let query = db.select().from(products);

        if (status) {
            query = query.where(eq(products.statusId, parseInt(status))) as any;
        }

        if (category) {
            const catId = parseInt(category);
            if (!isNaN(catId)) {
                query = query.where(eq(products.category_id, catId)) as any;
            } else {
                // if category slug provided, try to resolve via serviceCategories in other schema
                const { serviceCategories } = await import('@/db/serviceCategoriesSchema');
                const catRow = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, category)).limit(1);
                if (catRow.length) query = query.where(eq(products.category_id, catRow[0].id)) as any;
            }
        }

        if (subcategory) {
            const subId = parseInt(subcategory);
            if (!isNaN(subId)) {
                query = query.where(eq(products.subcategory_id, subId)) as any;
            } else {
                const { serviceSubcategories } = await import('@/db/serviceCategoriesSchema');
                const subRow = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, subcategory)).limit(1);
                if (subRow.length) query = query.where(eq(products.subcategory_id, subRow[0].id)) as any;
            }
        }

        const ordered = query.orderBy(desc(products.createdAt));
        const rows = limit && !isNaN(parseInt(limit)) ? await ordered.limit(parseInt(limit)) : await ordered;
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create product
export async function POST(request: NextRequest) {
    try {
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
        } = body;

        if (!slug || !title || typeof statusId === 'undefined') {
            return NextResponse.json({ error: 'Required fields: slug, title, statusId' }, { status: 400 });
        }

        const result = await db.insert(products).values({
            slug,
            title,
            excerpt: excerpt || '',
            content: content || null,
            thumbnail: thumbnail || null,
            price: (typeof price !== 'undefined' && price !== null) ? price : null,
            compare_at_price: (typeof compare_at_price !== 'undefined' && compare_at_price !== null) ? compare_at_price : null,
            currency: currency || 'NRS',
            statusId,
            category_id: category_id || null,
            subcategory_id: subcategory_id || null,
            model: model || null,
            capacity: capacity || null,
            warranty: warranty || null,
            inventory_status: inventory_status || 'in_stock',
            rating: (typeof rating !== 'undefined' && rating !== null) ? rating : '0',
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
        });

        const insertId = result?.[0]?.insertId;

        if (images && Array.isArray(images) && insertId) {
            const imageInserts = images.map((img: any) => ({
                product_id: insertId,
                url: img.url,
                alt: img.alt || '',
                is_primary: img.is_primary ? 1 : 0,
                display_order: img.display_order ? img.display_order : 0,
            }));
            try {
                await db.insert(productImages).values(imageInserts);
            } catch (err) {
                // ignore image insert failures but log
                console.error('Failed to insert product images:', err);
            }
        }

        try { revalidateTag('products', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Product created successfully', id: insertId }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A product with this slug already exists. Please use a different slug.' }, { status: 409 });
        }
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return NextResponse.json({ error: 'Invalid category or subcategory ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
    try {
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
        } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (slug !== undefined) updateData.slug = slug;
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (price !== undefined) updateData.price = price;
        if (compare_at_price !== undefined) updateData.compare_at_price = compare_at_price;
        if (currency !== undefined) updateData.currency = currency;
        if (statusId !== undefined) updateData.statusId = statusId;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id;
        if (model !== undefined) updateData.model = model;
        if (capacity !== undefined) updateData.capacity = capacity;
        if (warranty !== undefined) updateData.warranty = warranty;
        if (inventory_status !== undefined) updateData.inventory_status = inventory_status;
        if (rating !== undefined) updateData.rating = rating;
        if (metaTitle !== undefined) updateData.meta_title = metaTitle;
        if (metaDescription !== undefined) updateData.meta_description = metaDescription;

        await db.update(products).set(updateData).where(eq(products.id, id));

        // handle images - if images array provided, replace existing images
        if (images && Array.isArray(images)) {
            try {
                await db.delete(productImages).where(eq(productImages.product_id, id));
                const imageInserts = images.map((img: any) => ({
                    product_id: id,
                    url: img.url,
                    alt: img.alt || '',
                    is_primary: img.is_primary ? 1 : 0,
                    display_order: img.display_order ? img.display_order : 0,
                }));
                if (imageInserts.length) await db.insert(productImages).values(imageInserts);
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

        let productId = id ? parseInt(id) : null;
        if (!productId && slug) {
            const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
            if (!rows || rows.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            productId = rows[0].id;
        }

        if (!productId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const existing = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (!existing || existing.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        try {
            await db.delete(productImages).where(eq(productImages.product_id, productId as number));
        } catch (err) {
            // ignore
        }

        try {
            await db.delete(products).where(eq(products.id, productId as number));
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
