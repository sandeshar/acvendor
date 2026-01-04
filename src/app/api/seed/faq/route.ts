import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    FAQPageHeader,
    FAQCategories,
    FAQItems,
    FAQPageCTA
} from '@/db/faqPageSchema';

export async function POST() {
    try {
        await connectDB();
        
        // Clear existing data
        await FAQItems.deleteMany({});
        await FAQCategories.deleteMany({});
        await FAQPageHeader.deleteMany({});
        await FAQPageCTA.deleteMany({});

        // Seed Header Section
        await FAQPageHeader.create({
            title: 'Frequently Asked Questions',
            description: "Answers to common questions about products, shipping, installation, and warranty. If you don't find your answer, contact our support team.",
            search_placeholder: 'Search for a question...',
            is_active: 1,
        });

        // Seed Categories
        const categories = [
            { name: 'General', display_order: 1, is_active: 1 },
            { name: 'Orders & Shipping', display_order: 2, is_active: 1 },
            { name: 'Installation', display_order: 3, is_active: 1 },
            { name: 'Warranty', display_order: 4, is_active: 1 },
        ];

        const categoryIds: any[] = [];
        for (const category of categories) {
            const result = await FAQCategories.create(category);
            categoryIds.push(result._id);
        }

        // Seed FAQ Items
        const faqItemsData = [
            {
                category_id: categoryIds[0], // General
                question: 'Where are you located and what are your hours?',
                answer: 'We are based in Kathmandu and operate Monday through Saturday. Contact us for support and sales inquiries.',
                display_order: 1,
                is_active: 1,
            },
            {
                category_id: categoryIds[1], // Orders & Shipping
                question: 'How long does shipping take?',
                answer: 'Standard shipping is 2-5 business days depending on the product and your location. Expedited options are available at checkout.',
                display_order: 2,
                is_active: 1,
            },
            {
                category_id: categoryIds[2], // Installation
                question: 'Do you provide installation services?',
                answer: 'Yes. We offer professional installation by certified technicians; you can request an installation appointment during checkout or contact our support team.',
                display_order: 3,
                is_active: 1,
            },
            {
                category_id: categoryIds[3], // Warranty
                question: 'What warranty do your products have?',
                answer: 'Warranty varies by product and brand. Many AC units include a 1–5 year warranty on parts and compressor. Check the product page or contact support for details.',
                display_order: 4,
                is_active: 1,
            },
            {
                category_id: categoryIds[1], // Orders & Shipping
                question: 'Can I return or exchange a product?',
                answer: 'Returns and exchanges are handled according to our returns policy. Please contact support to start the process.',
                display_order: 5,
                is_active: 1,
            },
        ];

        for (const item of faqItemsData) {
            await FAQItems.create(item);
        }

        // Seed CTA Section
        await FAQPageCTA.create({
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
