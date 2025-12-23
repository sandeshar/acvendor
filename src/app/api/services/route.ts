import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { servicePosts } from '@/db/servicePostsSchema';
import { reviewTestimonialServices } from '@/db/reviewTestimonialServicesSchema';
import { reviewTestimonials } from '@/db/reviewSchema';
import { getUserIdFromToken, returnRole } from '@/utils/authHelper';
import { revalidateTag } from 'next/cache';

// GET - Fetch service posts
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const featured = searchParams.get('featured');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const limit = searchParams.get('limit');
        const status = searchParams.get('status');

        if (id) {
            const post = await db.select().from(servicePosts).where(eq(servicePosts.id, parseInt(id))).limit(1);

            if (post.length === 0) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }

            return NextResponse.json(post[0]);
        }

        if (slug) {
            const post = await db.select().from(servicePosts).where(eq(servicePosts.slug, slug)).limit(1);

            if (post.length === 0) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }

            return NextResponse.json(post[0]);
        }

        let query = db.select().from(servicePosts);

        if (featured === '1' || featured === 'true') {
            query = query.where(eq(servicePosts.featured, 1)) as any;
        }

        if (status) {
            query = query.where(eq(servicePosts.statusId, parseInt(status))) as any;
        }

        // Filter by category slug or id
        if (category) {
            const catId = parseInt(category);
            if (!isNaN(catId)) {
                query = query.where(eq(servicePosts.category_id, catId)) as any;
            } else {
                // If category is a slug, find id by slug
                const { serviceCategories } = await import('@/db/serviceCategoriesSchema');
                const catRow = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, category)).limit(1);
                if (catRow.length) query = query.where(eq(servicePosts.category_id, catRow[0].id)) as any;
            }
        }

        // Filter by subcategory slug or id
        if (subcategory) {
            const subId = parseInt(subcategory);
            if (!isNaN(subId)) {
                query = query.where(eq(servicePosts.subcategory_id, subId)) as any;
            } else {
                const { serviceSubcategories } = await import('@/db/serviceCategoriesSchema');
                const subRow = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, subcategory)).limit(1);
                if (subRow.length) query = query.where(eq(servicePosts.subcategory_id, subRow[0].id)) as any;
            }
        }

        const ordered = query.orderBy(desc(servicePosts.createdAt));
        const posts = limit && !isNaN(parseInt(limit)) ? await ordered.limit(parseInt(limit)) : await ordered;

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching service posts:', error);
        return NextResponse.json({ error: 'Failed to fetch service posts' }, { status: 500 });
    }
}

// POST - Create service post
export async function POST(request: NextRequest) {
    try {
        // Get user ID from JWT token
        const token = request.cookies.get('admin_auth')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        const authorId = getUserIdFromToken(token);
        if (!authorId) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { slug, title, excerpt, content, thumbnail, icon, featured, statusId, metaTitle, metaDescription, category_id, subcategory_id, price, price_type, price_label, price_description } = body;

        if (!slug || !title || !excerpt || !content || !statusId) {
            return NextResponse.json({ error: 'Required fields: slug, title, excerpt, content, statusId' }, { status: 400 });
        }

        const result = await db.insert(servicePosts).values({
            slug,
            title,
            excerpt,
            content,
            thumbnail: thumbnail || null,
            icon: icon || null,
            featured: featured || 0,
            category_id: category_id || null,
            subcategory_id: subcategory_id || null,
            price: price || null,
            price_type: price_type || 'fixed',
            price_label: price_label || null,
            price_description: price_description || null,
            authorId,
            statusId,
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
        });

        try { revalidateTag('services', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json(
            { success: true, message: 'Service post created successfully', id: result[0].insertId },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating service post:', error);

        // Handle duplicate slug error
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'A service with this slug already exists. Please use a different slug.' }, { status: 409 });
        }

        // Handle foreign key constraint error
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return NextResponse.json({ error: 'Invalid user ID or status ID' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create service post' }, { status: 500 });
    }
}

// PUT - Update service post
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, slug, title, excerpt, content, thumbnail, icon, featured, statusId, metaTitle, metaDescription, category_id, subcategory_id, price, price_type, price_label, price_description } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (slug !== undefined) updateData.slug = slug;
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
        if (icon !== undefined) updateData.icon = icon;
        if (featured !== undefined) updateData.featured = featured;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (subcategory_id !== undefined) updateData.subcategory_id = subcategory_id;
        if (price !== undefined) updateData.price = price;
        if (price_type !== undefined) updateData.price_type = price_type;
        if (price_label !== undefined) updateData.price_label = price_label;
        if (price_description !== undefined) updateData.price_description = price_description;
        if (statusId !== undefined) updateData.statusId = statusId;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

        await db.update(servicePosts).set(updateData).where(eq(servicePosts.id, id));

        try { revalidateTag('services', 'max'); } catch (e) { /* ignore */ }
        try { revalidateTag(`service-${id}`, 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Service post updated successfully' });
    } catch (error) {
        console.error('Error updating service post:', error);
        return NextResponse.json({ error: 'Failed to update service post' }, { status: 500 });
    }
}

// DELETE - Delete service post
export async function DELETE(request: NextRequest) {
    try {
        // Require authentication for delete operations
        const token = request.cookies.get('admin_auth')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized - missing token' }, { status: 401 });
        }
        const userId = getUserIdFromToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 });
        }
        const role = returnRole(token);
        // optionally check role (superadmin required for some endpoints); allow deletion for any valid role here
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

        if (!id && !slug) {
            return NextResponse.json({ error: 'ID or slug is required' }, { status: 400 });
        }

        // Resolve slug to id if necessary
        let postId = id ? parseInt(id) : null;
        if (!postId && slug) {
            const postRow = await db.select().from(servicePosts).where(eq(servicePosts.slug, slug)).limit(1);
            if (!postRow || postRow.length === 0) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }
            postId = postRow[0].id;
        }

        if (!postId) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Check existence
        const existing = await db.select().from(servicePosts).where(eq(servicePosts.id, postId)).limit(1);
        if (!existing || existing.length === 0) {
            return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
        }

        // Attempts to delete dependent rows first to avoid FK issues (be defensive)
        try {
            await db.delete(reviewTestimonialServices).where(eq(reviewTestimonialServices.serviceId, postId as number));
        } catch (err) {
            // ignore
        }
        try {
            await db.delete(reviewTestimonials).where(eq(reviewTestimonials.service, postId as number));
        } catch (err) {
            // ignore
        }

        try {
            await db.delete(servicePosts).where(eq(servicePosts.id, postId as number));
        } catch (err: any) {
            console.error('Deletion failed:', err);
            return NextResponse.json({ error: 'Failed to delete service post', details: err.message || String(err) }, { status: 500 });
        }

        try { revalidateTag('services', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json({ success: true, message: 'Service post deleted successfully' });
    } catch (error) {
        console.error('Error deleting service post:', error);
        return NextResponse.json({ error: 'Failed to delete service post' }, { status: 500 });
    }
}
