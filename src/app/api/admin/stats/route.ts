import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { BlogPost, User, Status } from '@/db/schema';
import { resolveStatusId } from '@/utils/resolveStatus';
import { ContactFormSubmissions } from '@/db/contactPageSchema';

export async function GET() {
    try {
        await connectDB();

        // Resolve status ObjectIds for numeric status codes
        const publishedStatusId = await resolveStatusId(2);
        const draftStatusId = await resolveStatusId(1);

        const [
            totalPosts,
            publishedPosts,
            draftPosts,
            recentPostsData,
            totalContact,
            newContact,
        ] = await Promise.all([
            BlogPost.countDocuments(),
            publishedStatusId ? BlogPost.countDocuments({ status: publishedStatusId }) : Promise.resolve(0),
            draftStatusId ? BlogPost.countDocuments({ status: draftStatusId }) : Promise.resolve(0),
            BlogPost.find()
                .sort({ createdAt: -1 })
                .limit(4)
                .lean(),
            ContactFormSubmissions.countDocuments(),
            ContactFormSubmissions.countDocuments({ status: 'new' }),
        ]);

        // For recent posts, fetch author and status info separately
        const recentPosts = await Promise.all(
            recentPostsData.map(async (post: any) => {
                const [author, statusInfo] = await Promise.all([
                    User.findById(post.authorId).lean(),
                    (async () => {
                        // Handle both ObjectId and numeric status values stored in DB
                        try {
                            if (post?.status && typeof post.status === 'string' && /^[a-fA-F0-9]{24}$/.test(post.status)) {
                                return await Status.findById(post.status).lean();
                            }
                            if (typeof post?.status === 'number') {
                                const resolved = await resolveStatusId(post.status);
                                return resolved ? await Status.findById(resolved).lean() : null;
                            }
                            // Fallback: attempt to find by name using numeric-to-name mapping
                            return await Status.findById(post.status).lean().catch(() => null);
                        } catch (e) {
                            return null;
                        }
                    })(),
                ]);
                return {
                    id: post._id,
                    slug: post.slug,
                    title: post.title,
                    authorName: author?.name || 'Unknown',
                    statusId: post.status,
                    statusName: statusInfo?.name || 'Unknown',
                    createdAt: post.createdAt,
                };
            })
        );

        return NextResponse.json({
            success: true,
            stats: {
                totalPosts,
                publishedPosts,
                draftPosts,
                totalContact,
                newContact,
            },
            recentPosts,
        });
    } catch (error) {
        console.error('GET /api/admin/stats error', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}