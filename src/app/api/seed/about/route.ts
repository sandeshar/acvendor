import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    aboutPageHero,
    aboutPageJourney,
    aboutPageStats,
    aboutPageFeatures,
    aboutPagePhilosophy,
    aboutPagePrinciples,
    aboutPageTeamSection,
    aboutPageTeamMembers,
    aboutPageCertifications,
    aboutPageCertificationsSection,
    aboutPageBadges,
    aboutPageCTA
} from '@/db/aboutPageSchema';

export async function POST() {
    try {
        // Clear existing data
        await db.delete(aboutPageHero);
        await db.delete(aboutPageJourney);
        await db.delete(aboutPageStats);
        await db.delete(aboutPageFeatures);
        await db.delete(aboutPagePhilosophy);
        await db.delete(aboutPagePrinciples);
        await db.delete(aboutPageTeamMembers);
        await db.delete(aboutPageTeamSection);
        await db.delete(aboutPageCertifications);
        await db.delete(aboutPageCertificationsSection);
        await db.delete(aboutPageBadges);
        await db.delete(aboutPageCTA);

        // Seed Hero Section
        try {
            await db.insert(aboutPageHero).values({
                title: "We Don't Just Write. We Build Worlds with Words.",
                description: "Welcome to Content Solution Nepal. We're a team of storytellers, strategists, and digital artisans dedicated to crafting narratives that resonate, engage, and drive growth. Your brand has a story. Let's tell it together.",
                button1_text: 'Meet the Team',
                button1_link: '#team',
                button2_text: 'Our Story',
                button2_link: '#story',
                hero_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                float_top_enabled: 1,
                float_top_icon: 'trending_up',
                float_top_title: 'Traffic Growth',
                float_top_value: '+145%',
                float_bottom_enabled: 1,
                float_bottom_icon: 'article',
                float_bottom_title: 'Content Pieces',
                float_bottom_value: '5k+',
                badge_text: 'Creative Team',
                highlight_text: 'Build Worlds',
                rating_text: 'Trusted by modern teams',
                hero_image_alt: 'Creative team collaborating in a modern office space',
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about hero:', err);
            throw new Error('About hero seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Journey Section
        await db.insert(aboutPageJourney).values({
            title: 'Our Story',
            paragraph1: 'Content Solution Nepal was born from a simple belief: that every business, big or small, deserves a voice that truly represents who they are and what they stand for. We started as a small team of writers who were tired of seeing generic, cookie-cutter content flooding the digital world.',
            paragraph2: 'We envisioned something better—content that tells stories, sparks emotions, and builds genuine connections. Today, we work with businesses across industries to create content strategies that not only attract attention but also inspire action and loyalty.',
            thinking_box_title: 'Our Thinking',
            thinking_box_content: 'We believe in the power of authenticity. In an age of algorithms and automation, human connection is what truly matters. We write with empathy, strategy, and a relentless focus on delivering value to your audience.',
            hero_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDda5biMwpMvtX_h7btShwaroEUJ1ijOwryycUDayNUEpgCs5Get0Ep6MoDB5u_3rw9c-R5gRyZWYnGqHuoiqBOTd3JUyVZuq0UUXI8R2BUjuY5HIq_-4V_ckfdOBetgRgNaf-rpTdE7AtC-rxH-KYR9y4D8oTpDqs_FSBTaaWChdJ0ilJKnKdEc2PzxxHoZixugfmxmKMdJ_Stnxg81KaJVzEjzoOwjuv-RFS4_nBIQkPZForGEXJHgs8q0H05VzwwvwgkkURRlMg',
            hero_image_alt: 'Team of professional HVAC technicians in blue uniforms discussing a blueprint',
            is_active: 1,
        });

        // Seed Stats
        const stats = [
            { label: 'Happy Clients', value: '150+', display_order: 1, is_active: 1 },
            { label: 'Projects Delivered', value: '500+', display_order: 2, is_active: 1 },
            { label: 'Team Members', value: '25', display_order: 3, is_active: 1 },
            { label: 'Years of Experience', value: '8', display_order: 4, is_active: 1 },
        ];

        for (const stat of stats) {
            await db.insert(aboutPageStats).values(stat);
        }

        // Seed Features
        const features = [
            { title: 'Tailored Strategies', description: 'Every project is unique. We craft custom content strategies that align with your goals.', icon: 'support_agent', display_order: 1, is_active: 1 },
            { title: 'Experienced Team', description: 'Our writers, strategists, and editors bring years of expertise across diverse industries.', icon: 'verified_user', display_order: 2, is_active: 1 },
            { title: 'Results-Driven', description: 'We measure success through your growth—more traffic, engagement, and conversions.', icon: 'amp_stories', display_order: 3, is_active: 1 },
            { title: 'Full-Service', description: 'From strategy to execution, we handle every aspect of your content journey.', icon: 'build_circle', display_order: 4, is_active: 1 },
        ];

        for (const feature of features) {
            await db.insert(aboutPageFeatures).values(feature);
        }

        // Seed Certifications (clients)
        const certifications = [
            { name: 'Hotel Himalaya', logo: '', link: '/', display_order: 1, is_active: 1 },
            { name: 'Nepal Bank', logo: '', link: '/', display_order: 2, is_active: 1 },
            { name: 'City Hospital', logo: '', link: '/', display_order: 3, is_active: 1 },
            { name: 'Kathmandu Uni', logo: '', link: '/', display_order: 4, is_active: 1 },
        ];

        for (const c of certifications) {
            await db.insert(aboutPageCertifications).values(c);
        }

        // Seed Certifications Section (title/subtitle)
        await db.insert(aboutPageCertificationsSection).values({ title: 'Trusted by Industry Leaders', subtitle: 'Authorized Sales & Service Partners for Major Global Brands', is_active: 1 });

        // Seed Badges (manufacturers)
        const badges = [
            { name: 'Brand A', logo: '', link: '/', display_order: 1, is_active: 1 },
            { name: 'Brand B', logo: '', link: '/', display_order: 2, is_active: 1 },
            { name: 'Brand C', logo: '', link: '/', display_order: 3, is_active: 1 },
        ];
        for (const b of badges) {
            await db.insert(aboutPageBadges).values(b);
        }

        // Seed Philosophy Section
        await db.insert(aboutPagePhilosophy).values({
            title: 'Our Philosophy',
            description: 'We approach content creation with a blend of art and science. Our philosophy is built on three core principles that guide every piece of content we produce.',
            is_active: 1,
        });

        // Seed Principles
        const principles = [
            { title: 'Authenticity First', description: "We believe in telling real stories that resonate. No fluff, no filler—just genuine, impactful content that reflects your brand's true voice.", display_order: 1, is_active: 1 },
            { title: 'Data-Informed Creativity', description: 'Great content is both an art and a science. We use data and insights to inform our creative decisions, ensuring every piece serves a purpose.', display_order: 2, is_active: 1 },
            { title: 'Continuous Improvement', description: 'The digital landscape is always evolving, and so are we. We stay ahead of trends and continuously refine our strategies to deliver the best results.', display_order: 3, is_active: 1 },
        ];

        for (const principle of principles) {
            await db.insert(aboutPagePrinciples).values(principle);
        }

        // Seed Team Section
        await db.insert(aboutPageTeamSection).values({
            title: 'Meet Our Team',
            description: 'Behind every great piece of content is a passionate team of creatives, strategists, and storytellers. Get to know the people who make it all happen.',
            is_active: 1,
        });

        // Seed Team Members
        const teamMembers = [
            {
                name: 'Sarah Johnson',
                role: 'Content Strategist',
                description: 'Sarah leads our content strategy team with over 10 years of experience helping brands find their voice.',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                image_alt: 'Sarah Johnson headshot',
                display_order: 1,
                is_active: 1,
            },
            {
                name: 'Michael Chen',
                role: 'Senior Writer',
                description: 'Michael specializes in long-form content and SEO writing, bringing technical expertise and creativity together.',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                image_alt: 'Michael Chen headshot',
                display_order: 2,
                is_active: 1,
            },
            {
                name: 'Emily Rodriguez',
                role: 'Social Media Manager',
                description: 'Emily crafts engaging social media campaigns that build communities and drive brand awareness.',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                image_alt: 'Emily Rodriguez headshot',
                display_order: 3,
                is_active: 1,
            },
            {
                name: 'David Kim',
                role: 'Creative Director',
                description: 'David oversees all creative projects, ensuring every piece of content meets our high standards of quality.',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                image_alt: 'David Kim headshot',
                display_order: 4,
                is_active: 1,
            },
        ];

        for (const member of teamMembers) {
            await db.insert(aboutPageTeamMembers).values(member);
        }

        // Seed CTA Section
        await db.insert(aboutPageCTA).values({
            title: 'Ready to Work Together?',
            description: "Let's create content that makes an impact. Get in touch with us today.",
            primary_button_text: 'Get Started',
            primary_button_link: '/contact',
            secondary_button_text: 'Browse Products',
            secondary_button_link: '/products',
            is_active: 1,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'About page seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding about page:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed about page',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
