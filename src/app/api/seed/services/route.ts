import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    servicesPageHero,
    servicesPageDetails,
    servicesPageProcessSection,
    servicesPageProcessSteps,
    servicesPageCTA,
    servicesPageFeatures,
    servicesPageBrands,
    servicesPageTrust,
} from '@/db/servicesPageSchema';
import { servicePosts } from '@/db/servicePostsSchema';
import { serviceCategories, serviceSubcategories } from '@/db/serviceCategoriesSchema';
import { reviewTestimonials } from '@/db/reviewSchema';
import { status, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
    try {
        const [firstUser] = await db.select().from(users).limit(1);
        const statusRows = await db.select().from(status);
        const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

        // Cleanup (ignore errors if tables don't exist)
        try {
            await db.delete(reviewTestimonials);
        } catch (e) { }
        try {
            await db.delete(servicePosts);
            await db.delete(serviceSubcategories);
            await db.delete(serviceCategories);
            await db.delete(servicesPageHero);
            await db.delete(servicesPageDetails);
            await db.delete(servicesPageProcessSection);
            await db.delete(servicesPageProcessSteps);
            await db.delete(servicesPageCTA);
            await db.delete(servicesPageFeatures);
            await db.delete(servicesPageBrands);
            await db.delete(servicesPageTrust);
        } catch (e) {
            // ignore
        }

        if (!firstUser || !publishedStatus) {
            return NextResponse.json({ error: 'Missing required data (users/status)' }, { status: 400 });
        }

        const generateLongContent = (title: string, paragraphs = 6) => {
            let out = `<h1>${title}</h1>`;
            for (let i = 1; i <= paragraphs; i++) {
                out += `<h2>Section ${i}</h2><p>${title} paragraph ${i} with practical advice and examples.</p>`;
            }
            out += `<h2>Conclusion</h2><p>Summary and next steps.</p>`;
            return out;
        };

        await db.insert(servicesPageHero).values({
            tagline: 'OUR SERVICES',
            title: 'Strategic Content That Converts',
            description: "We don't just write words; we craft experiences. Elevate your brand with data-driven content strategies designed to captivate your audience and drive meaningful growth.",
            badge_text: 'Premier Content Agency',
            highlight_text: 'That Converts',
            primary_cta_text: 'Get Started Now',
            primary_cta_link: '/contact',
            secondary_cta_text: 'View Our Work',
            secondary_cta_link: '/work',
            background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFR7tIGeKNlooQKoKzI99ZmhdAiYEeN7-W0VuqKkzn5_LkeWBmDZuWq2D1sKPTZW8vgWE1MvRe4iQHi9_Cley5gsMoFI7WJk7Oot3IO0kSVaiD0P5Gc0exZJ4CefO_K6hXJHRaHpWDvobpNb7rOeFCulKjyIwwaecQGDoo9nq5Aulw1jqloMBd1rvSNYcd0KVkIvmBdnXtBXr7_zQgUXnqHwROX0L36QjKYpwBnJflSI6CLCBY_AcCn8G29HBQPOlh3GMuTSz5KKw',
            hero_image_alt: 'Team collaborating on content strategy',
            stat1_value: '500+',
            stat1_label: 'Clients Served',
            stat2_value: '98%',
            stat2_label: 'Satisfaction Rate',
            stat3_value: '10k+',
            stat3_label: 'Articles Written',
            is_active: 1,
        });

        const categorySlug = 'content-services';
        await db.insert(serviceCategories).values({
            name: 'Content Services',
            slug: categorySlug,
            description: 'Strategic writing, SEO, and social storytelling crafted for measurable growth.',
            icon: 'category',
            thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
            display_order: 1,
            is_active: 1,
            meta_title: 'Content Services',
            meta_description: 'Explore SEO content, social media, website copy, and blog writing services.',
        });

        const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.slug, categorySlug)).limit(1);

        const serviceData = [
            {
                key: 'seo',
                icon: 'search',
                title: 'SEO Content',
                description: 'Search-optimized articles and landing pages.',
                bullets: ['Keyword research', 'On-page SEO', 'Long-form content'],
                image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80',
                image_alt: 'Content strategist reviewing SEO metrics on a laptop',
            },
            {
                key: 'social',
                icon: 'thumb_up',
                title: 'Social Media Content',
                description: 'Platform-ready posts and short-form video hooks.',
                bullets: ['Content calendars', 'Short video hooks', 'Design kits'],
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80',
                image_alt: 'Team planning social content with phones and laptops',
            },
            {
                key: 'copy',
                icon: 'language',
                title: 'Website Copywriting',
                description: 'Conversion-focused messaging and microcopy.',
                bullets: ['Value prop', 'Landing pages', 'Microcopy'],
                image: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80',
                image_alt: 'Copywriter drafting website copy next to design mockups',
            },
            {
                key: 'social',
                icon: 'thumb_up',
                title: 'Social Media Content',
                description: 'Platform-ready posts and short-form video hooks.',
                bullets: ['Content calendars', 'Short video hooks', 'Design kits'],
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80',
            },
            {
                key: 'copy',
                icon: 'language',
                title: 'Website Copywriting',
                description: 'Conversion-focused messaging and microcopy.',
                bullets: ['Value prop', 'Landing pages', 'Microcopy'],
                image: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80',
            },
        ];

        const subcategoryMap: Record<string, number> = {};

        for (const [index, s] of serviceData.entries()) {
            // Avoid duplicate slug insertion by checking for existing subcategory
            const [existingSub] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, s.key)).limit(1);
            if (!existingSub) {
                await db.insert(serviceSubcategories).values({
                    category_id: category?.id as number,
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
                const [subcat] = await db.select().from(serviceSubcategories).where(eq(serviceSubcategories.slug, s.key)).limit(1);
                if (subcat?.id) subcategoryMap[s.key] = subcat.id as number;
            } else {
                subcategoryMap[s.key] = existingSub.id as number;
            }
        }

        for (const [index, s] of serviceData.entries()) {
            const [existingDetail] = await db.select().from(servicesPageDetails).where(eq(servicesPageDetails.key, s.key)).limit(1);
            if (!existingDetail) {
                await db.insert(servicesPageDetails).values({
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

                const variantContent = generateLongContent(s.title, 4);
                const [existingPost] = await db.select().from(servicePosts).where(eq(servicePosts.slug, `${s.key}-guide`)).limit(1);
                if (!existingPost) {
                    await db.insert(servicePosts).values({
                        slug: `${s.key}-guide`,
                        title: `${s.title} — guide`,
                        excerpt: s.description,
                        content: variantContent,
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?.id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser.id,
                        statusId: publishedStatus.id,
                        meta_title: `${s.title} — guide`,
                        meta_description: `Professional ${s.title.toLowerCase()} services`,
                    });
                }

                const [existingBase] = await db.select().from(servicePosts).where(eq(servicePosts.slug, s.key)).limit(1);
                if (!existingBase) {
                    await db.insert(servicePosts).values({
                        slug: s.key,
                        title: s.title,
                        excerpt: s.description,
                        content: generateLongContent(s.title, 6),
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?.id,
                        subcategory_id: subcategoryMap[s.key],
                        price: '499.00',
                        price_type: 'fixed',
                        price_label: 'Starting at',
                        price_description: 'Pricing varies by scope and deliverables.',
                        currency: 'USD',
                        authorId: firstUser.id,
                        statusId: publishedStatus.id,
                        meta_title: s.title,
                        meta_description: `Professional ${s.title.toLowerCase()} services`,
                    });
                }
            }
        }

        await db.insert(servicesPageProcessSection).values({
            title: 'Our Process',
            description: 'We follow a proven, collaborative process to deliver high-quality content.',
            is_active: 1,
        });

        const processSteps = [
            { step_number: 1, title: 'Discovery', description: 'Understanding your needs', display_order: 1 },
            { step_number: 2, title: 'Strategy', description: 'Developing a tailored strategy', display_order: 2 },
            { step_number: 3, title: 'Creation', description: 'Creating compelling content', display_order: 3 },
        ];

        for (const step of processSteps) {
            await db.insert(servicesPageProcessSteps).values({
                ...step,
                is_active: 1,
            });
        }

        await db.insert(servicesPageCTA).values({
            title: 'Ready to Elevate Your Content?',
            description: "Let's discuss how we can help you achieve your goals.",
            button_text: 'Get a Quote',
            button_link: '/contact',
            is_active: 1,
        });
        // Seed Features (if none exist)
        const [featExists] = await db.select().from(servicesPageFeatures).limit(1);
        if (!featExists) {
            const defaultFeatures = [
                { icon: 'verified_user', title: 'Certified Experts', description: 'Trained technicians for all major brands.', display_order: 1 },
                { icon: 'avg_pace', title: 'Fast Response', description: 'Same-day service available in Kathmandu.', display_order: 2 },
                { icon: 'handyman', title: 'Genuine Parts', description: '100% original spare parts warranty.', display_order: 3 },
            ];
            for (const f of defaultFeatures) {
                await db.insert(servicesPageFeatures).values({ ...f, is_active: 1 });
            }
        }

        // Seed Brands (if none exist)
        const [brandExists] = await db.select().from(servicesPageBrands).limit(1);
        if (!brandExists) {
            const defaultBrands = [
                { name: 'SAMSUNG', logo: '', link: '', display_order: 1 },
                { name: 'DAIKIN', logo: '', link: '', display_order: 2 },
                { name: 'LG', logo: '', link: '', display_order: 3 },
                { name: 'MITSUBISHI', logo: '', link: '', display_order: 4 },
                { name: 'GREE', logo: '', link: '', display_order: 5 },
            ];
            for (const b of defaultBrands) {
                await db.insert(servicesPageBrands).values({ ...b, is_active: 1 });
            }
        }

        // Seed Trust section (if none exists)
        const [trustExists] = await db.select().from(servicesPageTrust).limit(1);
        if (!trustExists) {
            await db.insert(servicesPageTrust).values({
                title: 'Why Nepal trusts our service',
                description: 'Trusted by thousands of customers across the Kathmandu Valley.',
                quote_text: 'The team was professional and responsive — they fixed our system in a day and followed up to ensure everything was perfect.',
                quote_author: 'Rajesh Hamal',
                quote_role: 'Business Owner, Thamel',
                quote_image: '',
                is_active: 1,
            });
        }
        return NextResponse.json({ success: true, message: 'Services seeded successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error seeding services:', error);
        return NextResponse.json({ error: 'Failed to seed services', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
