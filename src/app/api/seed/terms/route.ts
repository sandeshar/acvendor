import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    TermsPageHeader,
    TermsPageSections
} from '@/db/termsPageSchema';

export async function POST() {
    try {
        await connectDB();
        
        // Clear existing data
        await TermsPageHeader.deleteMany({});
        await TermsPageSections.deleteMany({});

        // Seed Header
        await TermsPageHeader.create({
            title: 'Terms & Conditions',
            last_updated: 'October 26, 2023',
            is_active: 1,
        });

        // Seed Sections
        const sections = [
            {
                title: '1. Introduction',
                content: 'Welcome to Content Solution Nepal. By accessing our website, you agree to be bound by these terms and conditions. Please read them carefully. The services offered by us are subject to your acceptance without modification of all of the terms and conditions contained herein.',
                has_email: 0,
                display_order: 1,
                is_active: 1,
            },
            {
                title: '2. User Agreement & Conduct',
                content: 'You agree not to use the website for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the website in any way that could damage the website, the services, or the general business of Content Solution Nepal. This includes committing to not violate any local, state, national, or international law or regulation through your use of the site.',
                has_email: 0,
                display_order: 2,
                is_active: 1,
            },
            {
                title: '3. Intellectual Property Rights',
                content: 'All content on this website, including text, graphics, logos, and images, is the property of Content Solution Nepal or its content suppliers and is protected by international copyright laws. Unauthorized use of any materials on this site may violate copyright, trademark, and other laws. You may view, copy, and print documents and graphics incorporated in these documents from the website subject to the following: (1) the documents may be used solely for personal, informational, non-commercial purposes; and (2) the documents may not be modified or altered in any way.',
                has_email: 0,
                display_order: 3,
                is_active: 1,
            },
            {
                title: '4. Limitation of Liability',
                content: 'Content Solution Nepal will not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, the site or materials on the site, even if Content Solution Nepal has been advised of the possibility of such damages. The information on this website is provided "as is" with all faults and without warranty of any kind, expressed or implied.',
                has_email: 0,
                display_order: 4,
                is_active: 1,
            },
            {
                title: '5. Privacy Policy Summary',
                content: 'Our Privacy Policy, which is incorporated into these Terms of Service, describes how we collect, protect, and use your personal information. We are committed to protecting your privacy and security. By using this service, you agree to the terms of the Privacy Policy. You can find the full policy document here.',
                has_email: 0,
                display_order: 5,
                is_active: 1,
            },
            {
                title: '6. Governing Law',
                content: 'These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of Nepal. Any disputes will be handled in the jurisdiction of Kathmandu, Nepal.',
                has_email: 0,
                display_order: 6,
                is_active: 1,
            },
            {
                title: '7. Contact Information',
                content: 'Questions about the Terms of Service should be sent to us at contact@contentsolution.np. We are available to address any of your concerns.',
                has_email: 1,
                display_order: 7,
                is_active: 1,
            },
        ];

        for (const section of sections) {
            await TermsPageSections.create(section);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Terms page seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding terms page:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed terms page',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
