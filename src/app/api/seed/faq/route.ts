import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    faqPageHeader,
    faqCategories,
    faqItems,
    faqPageCTA
} from '@/db/faqPageSchema';

export async function POST() {
    try {
        // Clear existing data
        await db.delete(faqItems);
        await db.delete(faqCategories);
        await db.delete(faqPageHeader);
        await db.delete(faqPageCTA);

        // Seed Header Section
        await db.insert(faqPageHeader).values({
            title: 'Frequently Asked Questions',
            description: "Answers to common questions about our content marketing services. Find what you're looking for or get in touch with our team.",
            search_placeholder: 'Search for a question...',
            is_active: 1,
        });

        // Seed Categories
        const categories = [
            { name: 'General', display_order: 1, is_active: 1 },
            { name: 'Services', display_order: 2, is_active: 1 },
            { name: 'Pricing', display_order: 3, is_active: 1 },
            { name: 'Process', display_order: 4, is_active: 1 },
        ];

        const categoryIds: number[] = [];
        for (const category of categories) {
            const result = await db.insert(faqCategories).values(category);
            categoryIds.push(result[0].insertId);
        }

        // Seed FAQ Items
        const faqItemsData = [
            {
                category_id: categoryIds[0], // General
                question: 'What is content marketing and why is it important?',
                answer: 'Content marketing is a strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience — and, ultimately, to drive profitable customer action. It helps build trust, generate leads, and establish your brand as an authority in your industry.',
                display_order: 1,
                is_active: 1,
            },
            {
                category_id: categoryIds[1], // Services
                question: 'What types of content do you create?',
                answer: 'We specialize in a wide range of content formats, including blog posts, articles, website copy, social media content, email newsletters, case studies, and white papers. We tailor the content type to your specific goals and target audience.',
                display_order: 2,
                is_active: 1,
            },
            {
                category_id: categoryIds[2], // Pricing
                question: 'How do you determine the pricing for your services?',
                answer: 'Our pricing is based on the scope of the project, including the type and volume of content, the level of research required, and the overall strategy involved. We offer project-based pricing as well as monthly retainer packages. Contact us for a custom quote.',
                display_order: 3,
                is_active: 1,
            },
            {
                category_id: categoryIds[3], // Process
                question: 'What is your content creation process like?',
                answer: 'Our process begins with a discovery call to understand your business and goals. We then move to strategy and planning, followed by content creation, editing, and your review. Once approved, we help with publishing and promotion.',
                display_order: 4,
                is_active: 1,
            },
            {
                category_id: categoryIds[1], // Services
                question: 'Can I request revisions to the content you provide?',
                answer: 'Absolutely. We value your feedback. All of our packages include a set number of revision rounds to ensure the final content aligns perfectly with your vision and brand voice.',
                display_order: 5,
                is_active: 1,
            },
            {
                category_id: categoryIds[1], // Services
                question: 'Do you offer SEO services with your content?',
                answer: 'Yes, all our content is created with SEO best practices in mind. This includes keyword research, on-page optimization, and creating content that is structured to rank well in search engines.',
                display_order: 6,
                is_active: 1,
            },
        ];

        for (const item of faqItemsData) {
            await db.insert(faqItems).values(item);
        }

        // Seed CTA Section
        await db.insert(faqPageCTA).values({
            title: 'Still have questions?',
            description: "Can't find the answer you're looking for? Please chat to our friendly team.",
            button_text: 'Get in Touch',
            button_link: '/contact',
            is_active: 1,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'FAQ page seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding FAQ page:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed FAQ page',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
