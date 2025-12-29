import { db } from "@/db";
import { blogPageHero, blogPageCTA } from "@/db/blogPageSchema";
import { blogPosts, users, status } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Clear existing data
        await db.delete(blogPageHero);
        await db.delete(blogPageCTA);
        await db.delete(blogPosts);

        // Seed Hero
        await db.insert(blogPageHero).values({
            title: "The Content Solution Blog",
            subtitle: "Expert insights, trends, and strategies in content marketing for Nepali businesses.",
            background_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP7wRSP6PNVQerc44qHCLRoYYd7gD0XXulRDkuPttKz8c2wm7R80QfOir0XcMWFKjBGgyJ5pcMWrIKbPt6SCgNWruICSXdJlao0ovxqmc5rLvSBMdY5X6oZLjHPx9qPTGkgNMIYnTzo9hXeQxzkwUbhDDc7WVvEd49h17mKa6w8QfB2EIEDD7W8XIG5RncWJ-n5n8nCSqHu4E6zkNP0BsMHsoIQz9Vpi8C5qNBL4Po-ca4mAAVTciZ-3q8TREYwunoIejOppPSO_k"
        });

        // Seed CTA
        await db.insert(blogPageCTA).values({
            title: "Stay Ahead of the Curve",
            description: "Get the latest content marketing tips delivered to your inbox.",
            button_text: "Subscribe"
        });

        // Ensure users and statuses exist so this seeder can run independently
        const existingUsers = await db.select().from(users).limit(1);
        if (!existingUsers || existingUsers.length === 0) {
            const { hashPassword } = await import('@/utils/authHelper');
            await db.insert(users).values({
                name: 'Super Admin',
                email: 'admin@contentsolution.np',
                password: await hashPassword('password123'),
                role: 'superadmin',
            });
        }
        const existingStatuses = await db.select().from(status).limit(1);
        if (!existingStatuses || existingStatuses.length === 0) {
            await db.insert(status).values([
                { name: 'draft' },
                { name: 'published' },
                { name: 'in-review' },
            ]);
        }

        // Create a set of realistic, long blog posts
        const [firstUser] = await db.select().from(users).limit(1);
        const statusRows = await db.select().from(status);
        const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

        if (firstUser && publishedStatus) {
            const generateLongContent = (title: string, paragraphs = 20) => {
                let out = `<h1>${title}</h1>`;
                out += `<p>${title} — an in-depth guide.</p>`;
                for (let i = 1; i <= paragraphs; i++) {
                    out += `<h2>Section ${i}</h2>`;
                    out += `<p>${title} — detailed paragraph ${i}. This paragraph provides an extended explanation of the topic, covering best practices, examples, data points, and actionable steps. In many markets, local context matters. For Nepali businesses, it is important to combine global SEO principles with local intent, language usage, and cultural signals to create content that resonates with users and performs well in search engines.</p>`;
                    out += `<p>Additional insights: research, testing, and iteration are key. Tools and measurement help guide changes. Use analytics to identify which sections drive engagement and optimize headings for featured snippets. Consider designing content for skimmers with clear takeaways, lists, and callouts.</p>`;
                }
                out += `<h2>Wrap Up</h2><p>Concluding thoughts and next steps for implementing these strategies.</p>`;
                return out;
            };

            const baseTopics = [
                {
                    slug: 'content-marketing-strategy-nepal',
                    title: 'A Modern Content Marketing Strategy for Nepali Businesses',
                    content: generateLongContent('A Modern Content Marketing Strategy for Nepali Businesses', 8),
                    tags: 'content,marketing,nepal,strategy',
                    thumbnail: 'https://images.unsplash.com/photo-1528426776029-6f72c03bd0d7?auto=format&fit=crop&w=1400&q=80',
                    metaTitle: 'Content Marketing Strategy for Nepali Businesses',
                    metaDescription: 'Learn how to craft a content strategy that works in Nepal with audience research, pillar pages, and execution tips.',
                    authorId: firstUser.id,
                    status: publishedStatus.id,
                },
                {
                    slug: 'long-form-seo-best-practices',
                    title: 'Long-Form SEO: How to Create Content That Ranks',
                    content: generateLongContent('Long-Form SEO: How to Create Content That Ranks', 10),
                    tags: 'seo,long-form,content',
                    thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80',
                    metaTitle: 'Long-Form SEO Best Practices',
                    metaDescription: 'A guide to creating long-form content that ranks and converts.',
                    authorId: firstUser.id,
                    status: publishedStatus.id,
                },
                {
                    slug: 'case-study-pillar-page-growth',
                    title: 'Case Study: How Pillar Pages Drove Organic Growth',
                    content: `
                        <p>Pillar pages act as strategic anchors for topic clusters. In this case study, a Nepal-based client consolidated fragmented blog posts into a single, comprehensive pillar page, and interlinked related articles with clear navigation. Within 16 weeks, organic traffic to the topic cluster increased by 68% and keyword rankings improved on the target 10+ queries.</p>
                        <p>This approach worked because it improved topical relevance and user experience. The team included original research, local data points, and strong calls to action that guided readers to the services page. Remember: internal links transfer topical signals and help search engines understand the semantic relationships between pages.</p>
                    `,
                    tags: 'case-study,seo,pillar-pages',
                    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
                    metaTitle: 'Pillar Page Case Study',
                    metaDescription: 'Learn how consolidating content into pillar pages can grow organic traffic and rankings.',
                    authorId: firstUser.id,
                    status: publishedStatus.id,
                },
            ];

            // Expand baseTopics into many posts for volume — add variations and replicate sections
            const posts = [] as any[];
            for (let i = 0; i < baseTopics.length; i++) {
                const t = baseTopics[i];
                // base topic
                posts.push({ ...t, content: generateLongContent(t.title, 24) });
                // create 3 long variations per topic
                for (let v = 1; v <= 3; v++) {
                    posts.push({
                        slug: `${t.slug}-part-${v}`,
                        title: `${t.title} — Part ${v}`,
                        content: generateLongContent(`${t.title} — Part ${v}`, 24 + v * 6),
                        tags: t.tags + ',longform',
                        thumbnail: t.thumbnail,
                        metaTitle: `${t.metaTitle} — Part ${v}`,
                        metaDescription: t.metaDescription,
                        authorId: t.authorId,
                        status: t.status,
                    });
                }
            }

            const replaceBlogs = (s: string) => (typeof s === 'string' ? s.replace(/\/blogs/g, '/midea-ac') : s);

            for (const p of posts) {
                // ensure any references to '/blogs' in content or meta fields are rewritten to '/products'
                p.content = replaceBlogs(p.content);
                p.metaDescription = replaceBlogs(p.metaDescription);
                p.metaTitle = replaceBlogs(p.metaTitle);
                await db.insert(blogPosts).values(p as any);
            }
        }

        return NextResponse.json({ message: "Blog page seeded successfully" });
    } catch (error) {
        console.error("Error seeding blog page:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
