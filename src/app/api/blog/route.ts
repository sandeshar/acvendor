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
import { isValidSlug } from '@/utils/slug';
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
        const { title, slug, content, tags, thumbnail, metaTitle, metaDescription, status = 'draft', category_slug, category_id } = body;

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            );
        }

        // Validate slug format
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: 'Invalid slug. Use only letters, numbers, hyphens and underscores.' }, { status: 400 });
        }

        // Status mapping: draft = 1, published = 2, in-review = 3
        const numericStatus = status === 'published' ? 2 : 1;
        const statusId = await resolveStatusId(numericStatus);

        // Resolve category information if provided
        let resolvedCategoryId = null;
        let resolvedCategorySlug = '';
        let resolvedCategoryName = '';
        try {
            if (category_id) {
                const c = await (await import('@/db/blogCategoriesSchema')).BlogCategories.findById(category_id).lean();
                if (c) {
                    resolvedCategoryId = c._id;
                    resolvedCategorySlug = c.slug || '';
                    resolvedCategoryName = c.name || '';
                }
            } else if (category_slug) {
                const c = await (await import('@/db/blogCategoriesSchema')).BlogCategories.findOne({ slug: category_slug }).lean();
                if (c) {
                    resolvedCategoryId = c._id;
                    resolvedCategorySlug = c.slug || '';
                    resolvedCategoryName = c.name || '';
                } else {
                    // If only slug passed without existing category, use slug as name fallback
                    resolvedCategorySlug = category_slug;
                    resolvedCategoryName = category_slug;
                }
            }
        } catch (e) {
            console.error('Error resolving category in POST:', e);
        }

        // Insert blog post
        const newPost = await BlogPost.create({
            title,
            slug,
            content,
            tags: tags || null,
            thumbnail: thumbnail || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            category_id: resolvedCategoryId,
            category_name: resolvedCategoryName || '',
            category_slug: resolvedCategorySlug || '',
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

            let statusName: string | null = null;
            let statusNumeric: number | null = null;

            try {
                // Derive name from various representations
                if (typeof post.status === 'string' && /^[a-fA-F0-9]{24}$/.test(post.status)) {
                    const s = await Status.findById(post.status).lean();
                    statusName = s?.name || null;
                } else if (typeof post.status === 'number') {
                    const sName = Object.values(STATUS_MAP as any)[post.status - 1];
                    statusName = (sName as string) || null;
                } else if (typeof post.status === 'object' && post.status?.name) {
                    statusName = post.status.name;
                } else if (typeof post.status === 'string') {
                    statusName = post.status;
                }

                // Try to get numeric representation from whatever form we have
                statusNumeric = await statusNameToNumeric(statusName ?? post.status);
            } catch (e) {
                console.error('Error resolving status for post normalization:', e);
            }

            // Fallback: if numeric still unresolved but we have an ObjectId, fetch the doc and try again
            if (!statusNumeric && typeof post.status === 'string' && /^[a-fA-F0-9]{24}$/.test(post.status)) {
                try {
                    const s = await Status.findById(post.status).lean();
                    if (s?.name) {
                        statusName = statusName || s.name;
                        statusNumeric = await statusNameToNumeric(s.name);
                    }
                } catch (e) {
                    /* ignore */
                }
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
            const post = await BlogPost.findById(id).populate('status').lean();
            console.log('Query result (populated status):', post);

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
            console.log('Fetching post by slug:', slug);
            const post = await BlogPost.findOne({ slug }).populate('status').lean();
            console.log('Raw post result for slug (populated status):', slug, { found: !!post, status: post?.status });

            if (!post) {
                console.log('Post not found for slug:', slug);
                return NextResponse.json(
                    { error: 'Post not found' },
                    { status: 404 }
                );
            }

            const statusNumeric = await statusNameToNumeric(post.status);
            console.log('Resolved status for slug:', slug, { rawStatus: post.status, statusNumeric });

            const normalized = await normalizePost(post);
            return NextResponse.json(normalized);
        }

        // Get posts with optional search, category and pagination
        console.log('Fetching all posts via API');
        const sort = searchParams.get('sort') || 'newest';
        const isAdmin = searchParams.get('admin') === 'true';
        const statusParam = searchParams.get('status');

        const sortOrder = sort === 'oldest' ? 1 : -1;

        // Build a safe query that combines status, search and category filters
        const andConditions: any[] = [];

        if (isAdmin) {
            if (statusParam) {
                const sid = await resolveStatusId(Number(statusParam));
                if (sid) andConditions.push({ status: sid });
            }
        } else {
            const publishedStatusId = await resolveStatusId(2);
            if (publishedStatusId) andConditions.push({ status: publishedStatusId });
        }

        if (search) {
            andConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (category) {
            andConditions.push({
                $or: [
                    { tags: { $regex: category, $options: 'i' } },
                    { category_slug: { $regex: category, $options: 'i' } },
                    { category_name: { $regex: category, $options: 'i' } },
                ]
            });
        }

        // Compose final query
        const finalQuery = andConditions.length === 0 ? {} : (andConditions.length === 1 ? andConditions[0] : { $and: andConditions });

        // total count (respect filters)
        const total = await BlogPost.countDocuments(finalQuery);

        // pagination
        let posts: any[];
        if (limit && !isNaN(parseInt(limit))) {
            const l = parseInt(limit);
            const o = offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0;
            posts = await BlogPost.find(finalQuery).sort({ createdAt: sortOrder }).limit(l).skip(o).populate('status').lean();
            const normalizedPosts = await Promise.all(posts.map((p: any) => normalizePost(p)));

            if (isAdmin || searchParams.get('meta') === 'true') {
                return NextResponse.json({ posts: normalizedPosts, total });
            }
            return NextResponse.json(normalizedPosts);
        }

        posts = await BlogPost.find(finalQuery).sort({ createdAt: sortOrder }).populate('status').lean();
        const normalizedPosts = await Promise.all(posts.map((p: any) => normalizePost(p)));
        if (isAdmin || searchParams.get('meta') === 'true') {
            return NextResponse.json({ posts: normalizedPosts, total });
        }
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
        const { slug, title, newSlug, content, tags, thumbnail, metaTitle, metaDescription, status = 'draft', category_id, category_slug } = body;

        // Validate required fields
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Validate slug format
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 });
        }

        // Validate newSlug if provided
        if (newSlug && !isValidSlug(newSlug)) {
            return NextResponse.json({ error: 'Invalid newSlug. Use only letters, numbers, hyphens and underscores.' }, { status: 400 });
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

        // Resolve category if provided on update
        if (category_id !== undefined || category_slug !== undefined) {
            try {
                let c: any = null;
                if (category_id) {
                    c = await (await import('@/db/blogCategoriesSchema')).BlogCategories.findById(category_id).lean();
                }
                if (!c && category_slug) {
                    c = await (await import('@/db/blogCategoriesSchema')).BlogCategories.findOne({ slug: category_slug }).lean();
                }
                if (c) {
                    updateData.category_id = c._id;
                    updateData.category_slug = c.slug || '';
                    updateData.category_name = c.name || '';
                } else {
                    // if slug given but no matching category, set slug/name to given slug
                    if (category_slug !== undefined) {
                        updateData.category_id = null;
                        updateData.category_slug = category_slug || '';
                        updateData.category_name = category_slug || '';
                    } else {
                        updateData.category_id = category_id || null;
                    }
                }
            } catch (e) {
                console.error('Error resolving category on update:', e);
                if (category_id !== undefined) updateData.category_id = category_id || null;
                if (category_slug !== undefined) updateData.category_slug = category_slug || '';
            }
        }

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
