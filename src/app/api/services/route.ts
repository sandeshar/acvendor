import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { ServicePosts } from '@/db/servicePostsSchema';
import { ReviewTestimonialServices } from '@/db/reviewTestimonialServicesSchema';
import { ReviewTestimonials } from '@/db/reviewSchema';
import { Status } from '@/db/schema';
import { getUserIdFromToken, returnRole } from '@/utils/authHelper';
import { isValidSlug } from '@/utils/slug';
import { revalidateTag } from 'next/cache';

async function resolveStatusId(statusId: any) {
    if (!statusId) return null;
    if (typeof statusId === 'string' && statusId.length === 24) return statusId;

    let statusName = '';
    if (statusId === 1 || statusId === '1') statusName = 'Published';
    else if (statusId === 2 || statusId === '2') statusName = 'Published';
    else if (statusId === 3 || statusId === '3') statusName = 'Draft';

    if (statusName) {
        const s = await Status.findOne({ name: new RegExp(statusName, 'i') }).lean();
        if (s) return s._id;
    }
    return statusId;
}

// GET - Fetch service posts
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const featured = searchParams.get('featured');
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const limit = searchParams.get('limit');
        const status = searchParams.get('status');

        if (id) {
            const post = await ServicePosts.findById(id).populate('statusId').lean();

            if (!post) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }

            const sName = post.statusId?.name || '';
            let numericStatusId = 1;
            if (sName.toLowerCase() === 'published') numericStatusId = 2;
            else if (sName.toLowerCase() === 'draft') numericStatusId = 1;

            return NextResponse.json({
                ...post,
                id: post._id.toString(),
                statusId: numericStatusId,
                category_id: post.category_id?.toString(),
                subcategory_id: post.subcategory_id?.toString(),
            });
        }

        if (slug) {
            const post = await ServicePosts.findOne({ slug }).populate('statusId').lean();

            if (!post) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }

            const sName = post.statusId?.name || '';
            let numericStatusId = 1;
            if (sName.toLowerCase() === 'published') numericStatusId = 2;
            else if (sName.toLowerCase() === 'draft') numericStatusId = 1;

            return NextResponse.json({
                ...post,
                id: post._id.toString(),
                statusId: numericStatusId,
                category_id: post.category_id?.toString(),
                subcategory_id: post.subcategory_id?.toString(),
            });
        }

        const filter: any = {};

        if (featured === '1' || featured === 'true') {
            filter.featured = 1;
        }

        if (status) {
            filter.statusId = await resolveStatusId(status);
        }

        // Filter by category slug or id
        if (category) {
            if (category.length === 24) {
                filter.category_id = category;
            } else {
                // If category is a slug, find id by slug
                const { ServiceCategories } = await import('@/db/serviceCategoriesSchema');
                const catRow = await ServiceCategories.findOne({ slug: category }).lean();
                if (catRow) filter.category_id = catRow._id;
            }
        }

        // Filter by subcategory slug or id
        if (subcategory) {
            if (subcategory.length === 24) {
                filter.subcategory_id = subcategory;
            } else {
                const { ServiceSubcategories } = await import('@/db/serviceCategoriesSchema');
                const subRow = await ServiceSubcategories.findOne({ slug: subcategory }).lean();
                if (subRow) filter.subcategory_id = subRow._id;
            }
        }

        let query = ServicePosts.find(filter)
            .populate('statusId')
            .sort({ createdAt: -1 })
            .lean();
        const posts = limit && !isNaN(parseInt(limit)) ? await query.limit(parseInt(limit)) : await query;

        const formattedPosts = posts.map((p: any) => {
            const sId = p.statusId?._id ? p.statusId._id.toString() : p.statusId?.toString();
            const sName = p.statusId?.name || '';

            // Map status name back to numeric ID for the admin UI if needed
            let numericStatusId = 1; // Default to Draft
            if (sName.toLowerCase() === 'published') numericStatusId = 2;
            else if (sName.toLowerCase() === 'draft') numericStatusId = 1;
            else if (sName.toLowerCase() === 'in review') numericStatusId = 3;

            return {
                ...p,
                id: p._id.toString(),
                statusId: numericStatusId, // Use numeric ID for admin UI compatibility
                realStatusId: sId,
                statusName: sName,
                category_id: p.category_id?.toString(),
                subcategory_id: p.subcategory_id?.toString(),
            };
        });

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching service posts:', error);
        return NextResponse.json({ error: 'Failed to fetch service posts' }, { status: 500 });
    }
}

// POST - Create service post
export async function POST(request: NextRequest) {
    try {
        await connectDB();

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

        // Validate slug format
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: 'Invalid slug. Use only lowercase letters, numbers and hyphens.' }, { status: 400 });
        }

        const finalStatusId = await resolveStatusId(statusId);

        const newPost = await ServicePosts.create({
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
            statusId: finalStatusId,
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
        });

        try { revalidateTag('services', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json(
            { success: true, message: 'Service post created successfully', id: newPost._id.toString() },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating service post:', error);

        // Handle duplicate slug error
        if (error.code === 11000 && error.keyPattern?.slug) {
            return NextResponse.json({ error: 'A service with this slug already exists. Please use a different slug.' }, { status: 409 });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create service post' }, { status: 500 });
    }
}

// PUT - Update service post
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, slug, title, excerpt, content, thumbnail, icon, featured, statusId, metaTitle, metaDescription, category_id, subcategory_id, price, price_type, price_label, price_description } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (slug !== undefined) {
            if (!isValidSlug(slug)) return NextResponse.json({ error: 'Invalid slug. Use only lowercase letters, numbers and hyphens.' }, { status: 400 });
            updateData.slug = slug;
        }
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
        if (statusId !== undefined) updateData.statusId = await resolveStatusId(statusId);
        if (metaTitle !== undefined) updateData.meta_title = metaTitle;
        if (metaDescription !== undefined) updateData.meta_description = metaDescription;

        await ServicePosts.findByIdAndUpdate(id, updateData, { new: true });

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
        await connectDB();

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
        let postId: any = id || null;
        if (!postId && slug) {
            const postRow = await ServicePosts.findOne({ slug }).lean();
            if (!postRow) {
                return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
            }
            postId = postRow._id;
        }

        if (!postId) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Check existence
        const existing = await ServicePosts.findById(postId).lean();
        if (!existing) {
            return NextResponse.json({ error: 'Service post not found' }, { status: 404 });
        }

        // Attempts to delete dependent rows first to avoid FK issues (be defensive)
        try {
            await ReviewTestimonialServices.deleteMany({ serviceId: postId });
        } catch (err) {
            // ignore
        }
        try {
            await ReviewTestimonials.deleteMany({ service: postId });
        } catch (err) {
            // ignore
        }

        try {
            await ServicePosts.findByIdAndDelete(postId);
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
