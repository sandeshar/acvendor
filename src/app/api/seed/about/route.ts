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

// Use centralized defaults
import {
    DEFAULT_FEATURES,
    DEFAULT_STATS,
    DEFAULT_HERO_IMAGE,
    DEFAULT_HERO_IMAGE_ALT,
    DEFAULT_HIGHLIGHTS,
    DEFAULT_JOURNEY_TITLE,
    DEFAULT_THINKING_BOX_TITLE,
    DEFAULT_THINKING_BOX_CONTENT,
    DEFAULT_CERTIFICATIONS,
    DEFAULT_CERTIFICATIONS_SECTION,
} from '@/db/aboutPageDefaults';

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
            title: DEFAULT_JOURNEY_TITLE,
            paragraph1: 'Content Solution Nepal was born from a simple belief: that every business, big or small, deserves a voice that truly represents who they are and what they stand for. We started as a small team of writers who were tired of seeing generic, cookie-cutter content flooding the digital world.',
            paragraph2: 'We envisioned something better—content that tells stories, sparks emotions, and builds genuine connections. Today, we work with businesses across industries to create content strategies that not only attract attention but also inspire action and loyalty.',
            thinking_box_title: DEFAULT_THINKING_BOX_TITLE,
            thinking_box_content: DEFAULT_THINKING_BOX_CONTENT,
            highlights: JSON.stringify(DEFAULT_HIGHLIGHTS),
            hero_image: DEFAULT_HERO_IMAGE,
            hero_image_alt: DEFAULT_HERO_IMAGE_ALT,
            is_active: 1,
        });

        // Seed Stats
        // Use centralized DEFAULT_STATS
        for (const s of DEFAULT_STATS) {
            await db.insert(aboutPageStats).values({ label: s.label, value: s.value, display_order: s.display_order, is_active: s.is_active });
        }

        // Seed Features
        // Seed features from centralized DEFAULT_FEATURES
        for (const [i, f] of DEFAULT_FEATURES.entries()) {
            await db.insert(aboutPageFeatures).values({ title: f.title, description: f.description, icon: f.icon || '', display_order: i + 1, is_active: 1 });
        }

        // Seed Certifications (clients)
        // Seed Certifications (clients) from centralized defaults
        for (const [i, c] of DEFAULT_CERTIFICATIONS.entries()) {
            await db.insert(aboutPageCertifications).values({ name: c.name, logo: c.logo || '', link: c.link || '#', display_order: i + 1, is_active: 1 });
        }

        // Seed Certifications Section (title/subtitle) from defaults
        await db.insert(aboutPageCertificationsSection).values({ title: DEFAULT_CERTIFICATIONS_SECTION.title, subtitle: DEFAULT_CERTIFICATIONS_SECTION.subtitle, is_active: 1 });

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
            secondary_button_link: '/midea-ac',
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
