import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost, Status } from '@/db/schema';
import { resolveStatusId, statusNameToNumeric } from '@/utils/resolveStatus';

const STATUS_MAP = {
    1: 'Draft',
    2: 'Published',
    3: 'In Review'
};
import { getUserIdFromToken } from '@/utils/authHelper';
import { revalidateTag } from 'next/cache';

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
        const { title, slug, content, tags, thumbnail, metaTitle, metaDescription, status = 'draft' } = body;

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            );
        }

        // Status mapping: draft = 1, published = 2, in-review = 3
        const numericStatus = status === 'published' ? 2 : 1;
        const statusId = await resolveStatusId(numericStatus);

        // Insert blog post
        const newPost = await BlogPost.create({
            title,
            slug,
            content,
            tags: tags || null,
            thumbnail: thumbnail || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            authorId,
            status: statusId || undefined,
        });

        // Revalidate blog post lists and related caches
        try { revalidateTag('blog-posts', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json(
            {
                success: true,
                message: 'Blog post created successfully',
                id: newPost._id
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating blog post:', error);

        // Handle duplicate slug error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'A post with this slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const slug = searchParams.get('slug');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const meta = searchParams.get('meta');

        console.log('GET request - id:', id, 'slug:', slug);

        const normalizePost = async (post: any) => {
            if (!post) return post;
            const statusNumeric = await statusNameToNumeric(post.status);
            let statusName: string | null = null;
            if (typeof post.status === 'string' && /^[a-fA-F0-9]{24}$/.test(post.status)) {
                const s = await Status.findById(post.status).lean();
                statusName = s?.name || null;
            } else if (typeof post.status === 'number') {
                const sName = Object.values(STATUS_MAP as any)[post.status - 1];
                statusName = (sName as string) || null;
            }
            return {
                ...post,
                // Ensure front-end compatibility: expose `id` as string _id when numeric ids were expected previously
                id: post._id ?? post.id,
                status: statusNumeric ?? post.status,
                statusName,
            };
        };

        if (id) {
            // Get single post by ID
            console.log('Fetching post by ID:', id);
            const post = await BlogPost.findById(id).lean();
            console.log('Query result:', post);

            if (!post) {
                return NextResponse.json(
                    { error: 'Post not found' },
                    { status: 404 }
                );
            }

            const normalized = await normalizePost(post);
            return NextResponse.json(normalized);
        }

        if (slug) {
            // Get single post by slug
            const post = await BlogPost.findOne({ slug }).lean();

            if (!post) {
                return NextResponse.json(
                    { error: 'Post not found' },
                    { status: 404 }
                );
            }

            const normalized = await normalizePost(post);
            return NextResponse.json(normalized);
        }

        // Get posts with optional search, category and pagination
        console.log('Fetching all posts via API');
        const sort = searchParams.get('sort') || 'newest';
        const publishedStatusId = await resolveStatusId(2);
        let query: any = publishedStatusId ? { status: publishedStatusId } : {}; // default to published if resolved

        if (search) {
            // search across title, content, tags
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.tags = { $regex: category, $options: 'i' };
        }

        const sortOrder = sort === 'oldest' ? 1 : -1;

        // total count
        const total = publishedStatusId ? await BlogPost.countDocuments({ status: publishedStatusId }) : await BlogPost.countDocuments();

        // pagination
        let posts: any[];
        if (limit && !isNaN(parseInt(limit))) {
            const l = parseInt(limit);
            const o = offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0;
            posts = await BlogPost.find(query).sort({ createdAt: sortOrder }).limit(l).skip(o).lean();
            const normalizedPosts = await Promise.all(posts.map((p: any) => normalizePost(p)));
            if (meta === 'true') {
                return NextResponse.json({ posts: normalizedPosts, total });
            }
            return NextResponse.json(normalizedPosts);
        }

        posts = await BlogPost.find(query).sort({ createdAt: sortOrder }).lean();
        const normalizedPosts = await Promise.all(posts.map((p: any) => normalizePost(p)));
        console.log('Found posts:', normalizedPosts.length);
        return NextResponse.json(normalizedPosts);
    } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        console.error('Error details:', error.message, error.stack);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
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

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { slug, title, newSlug, content, tags, thumbnail, metaTitle, metaDescription, status = 'draft' } = body;

        // Validate required fields
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Status mapping: draft = 1, published = 2, in-review = 3
        const numericStatus = status === 'published' ? 2 : status === 'in-review' ? 3 : 1;
        const statusId = await resolveStatusId(numericStatus);

        // Build update object dynamically
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (title) updateData.title = title;
        if (newSlug) updateData.slug = newSlug;
        if (content) updateData.content = content;
        if (tags !== undefined) updateData.tags = tags || null;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail || null;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle || null;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription || null;
        if (status) updateData.status = statusId || updateData.status;

        // Update blog post
        await BlogPost.findOneAndUpdate(
            { slug },
            updateData,
            { new: true }
        );

        try { revalidateTag('blog-posts', 'max'); } catch (e) { /* ignore */ }
        try { if (newSlug) revalidateTag(`blog-post-${newSlug}`, 'max'); } catch (e) { /* ignore */ }
        try { revalidateTag(`blog-post-${slug}`, 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json(
            {
                success: true,
                message: 'Blog post updated successfully'
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error updating blog post:', error);

        // Handle duplicate slug error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'A post with this slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Delete blog post
        await BlogPost.findByIdAndDelete(id);

        try { revalidateTag('blog-posts', 'max'); } catch (e) { /* ignore */ }

        return NextResponse.json(
            {
                success: true,
                message: 'Blog post deleted successfully'
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        );
    }
}
