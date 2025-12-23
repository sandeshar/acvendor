import { NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, users, status } from '@/db/schema';
import { contactFormSubmissions } from '@/db/contactPageSchema';
import { eq, desc, count } from 'drizzle-orm';

export async function GET() {
    try {
        const [
            totalPosts,
            publishedPosts,
            draftPosts,
            recentPosts,
            totalContact,
            newContact,
        ] = await Promise.all([
            db.select({ count: count() }).from(blogPosts),
            db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 2)),
            db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.status, 1)),
            db.select({
                id: blogPosts.id,
                slug: blogPosts.slug,
                title: blogPosts.title,
                authorName: users.name,
                statusId: blogPosts.status,
                statusName: status.name,
                createdAt: blogPosts.createdAt,
            })
                .from(blogPosts)
                .leftJoin(users, eq(blogPosts.authorId, users.id))
                .leftJoin(status, eq(blogPosts.status, status.id))
                .orderBy(desc(blogPosts.createdAt))
                .limit(4),
            db.select({ count: count() }).from(contactFormSubmissions),
            db.select({ count: count() }).from(contactFormSubmissions).where(eq(contactFormSubmissions.status, 'new')),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalPosts: Number(totalPosts[0]?.count || 0),
                publishedPosts: Number(publishedPosts[0]?.count || 0),
                draftPosts: Number(draftPosts[0]?.count || 0),
                totalContact: Number(totalContact[0]?.count || 0),
                newContact: Number(newContact[0]?.count || 0),
            },
            recentPosts,
        });
    } catch (error) {
        console.error('GET /api/admin/stats error', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}