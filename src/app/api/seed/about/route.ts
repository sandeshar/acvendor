import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    AboutPageHero,
    AboutPageJourney,
    AboutPageStats,
    AboutPageFeatures,
    AboutPagePhilosophy,
    AboutPagePrinciples,
    AboutPageTeamSection,
    AboutPageTeamMembers,
    AboutPageCertifications,
    AboutPageCertificationsSection,
    AboutPageBadges,
    AboutPageCTA
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
        await connectDB();

        // Clear existing data
        await AboutPageHero.deleteMany({});
        await AboutPageJourney.deleteMany({});
        await AboutPageStats.deleteMany({});
        await AboutPageFeatures.deleteMany({});
        await AboutPagePhilosophy.deleteMany({});
        await AboutPagePrinciples.deleteMany({});
        await AboutPageTeamMembers.deleteMany({});
        await AboutPageTeamSection.deleteMany({});
        await AboutPageCertifications.deleteMany({});
        await AboutPageCertificationsSection.deleteMany({});
        await AboutPageBadges.deleteMany({});
        await AboutPageCTA.deleteMany({});

        // Seed Hero Section
        try {
            await AboutPageHero.create({
                title: "Your Trusted Partner for Cooling Solutions in Nepal",
                description: "Welcome to AC Vendor. We are a team of dedicated professionals committed to providing high-quality air conditioning products and services. From sales to installation and maintenance, we ensure your comfort all year round.",
                button1_text: 'Meet the Team',
                button1_link: '#team',
                button2_text: 'Our Story',
                button2_link: '#story',
                hero_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGNaIxV2yP8yow4vP4sY-zbc2rGNflWrmYA6XGpOKuy0LiNEdcuCLu0m9b1WbTFpw3v3-d-OgpGVH8wbsGNshWs2GFVT-zZTMpF7UJ9ykyyLa1PyF_vfQSbW6f2fveOmmpTQ66uhhM5w8bJLYOOoULMgIWwePl-eTFMrzCfXWjVvUTejB5cJEZ0b5tqEM7RSy-eO-CklDZypw8e5SRxq2IFJ_7PtJNqm5ij0ilfaT66A_WIGoPSQrH8kiHzxAp7tHrL-vjB3sBNo',
                badge_text: 'Expert Team',
                hero_image_alt: 'AC Vendor team collaborating in a modern office space',
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about hero:', err);
            throw new Error('About hero seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Journey Section
        try {
            await AboutPageJourney.create({
                title: DEFAULT_JOURNEY_TITLE,
                paragraph1: 'AC Vendor was born from a simple belief: that every home and business in Nepal deserves reliable and efficient cooling solutions. We started as a small team of technicians who were passionate about providing quality service and genuine products.',
                paragraph2: 'We envisioned something better—a one-stop shop for all air conditioning needs, where customers can find the best brands and expert support. Today, we are proud to be a leading provider of AC solutions, serving thousands of satisfied customers across the country.',
                thinking_box_title: DEFAULT_THINKING_BOX_TITLE,
                thinking_box_content: DEFAULT_THINKING_BOX_CONTENT,
                highlights: JSON.stringify(DEFAULT_HIGHLIGHTS),
                hero_image: DEFAULT_HERO_IMAGE,
                hero_image_alt: DEFAULT_HERO_IMAGE_ALT,
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about journey:', err);
            throw new Error('About journey seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Stats
        // Use centralized DEFAULT_STATS
        try {
            for (const s of DEFAULT_STATS) {
                await AboutPageStats.create({ label: s.label, value: s.value, display_order: s.display_order, is_active: s.is_active });
            }
        } catch (err) {
            console.error('Error seeding about stats:', err);
            throw new Error('About stats seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Features
        // Seed features from centralized DEFAULT_FEATURES
        try {
            for (const [i, f] of DEFAULT_FEATURES.entries()) {
                await AboutPageFeatures.create({ title: f.title, description: f.description, icon: f.icon || '', display_order: i + 1, is_active: 1 });
            }
        } catch (err) {
            console.error('Error seeding about features:', err);
            throw new Error('About features seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Certifications (clients)
        // Seed Certifications (clients) from centralized defaults
        try {
            for (const [i, c] of DEFAULT_CERTIFICATIONS.entries()) {
                await AboutPageCertifications.create({ name: c.name, logo: c.logo || '/logo.png', link: c.link || '#', display_order: i + 1, is_active: 1 });
            }

            // Seed Certifications Section (title/subtitle) from defaults
            await AboutPageCertificationsSection.create({ title: DEFAULT_CERTIFICATIONS_SECTION.title, subtitle: DEFAULT_CERTIFICATIONS_SECTION.subtitle, is_active: 1 });
        } catch (err) {
            console.error('Error seeding about certifications:', err);
            throw new Error('About certifications seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Badges (manufacturers)
        try {
            const badges = [
                { name: 'Brand A', logo: '', link: '/', display_order: 1, is_active: 1 },
                { name: 'Brand B', logo: '', link: '/', display_order: 2, is_active: 1 },
                { name: 'Brand C', logo: '', link: '/', display_order: 3, is_active: 1 },
            ];
            for (const b of badges) {
                await AboutPageBadges.create({ name: b.name, logo: b.logo || '/logo.png', link: b.link || '/', display_order: b.display_order, is_active: b.is_active });
            }
        } catch (err) {
            console.error('Error seeding about badges:', err);
            throw new Error('About badges seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Philosophy Section
        try {
            await AboutPagePhilosophy.create({
                title: 'Our Philosophy',
                description: 'We approach content creation with a blend of art and science. Our philosophy is built on three core principles that guide every piece of content we produce.',
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about philosophy:', err);
            throw new Error('About philosophy seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Principles
        try {
            const principles = [
                { title: 'Authenticity First', description: "We believe in telling real stories that resonate. No fluff, no filler—just genuine, impactful content that reflects your brand's true voice.", display_order: 1, is_active: 1 },
                { title: 'Data-Informed Creativity', description: 'Great content is both an art and a science. We use data and insights to inform our creative decisions, ensuring every piece serves a purpose.', display_order: 2, is_active: 1 },
                { title: 'Continuous Improvement', description: 'The digital landscape is always evolving, and so are we. We stay ahead of trends and continuously refine our strategies to deliver the best results.', display_order: 3, is_active: 1 },
            ];

            for (const principle of principles) {
                await AboutPagePrinciples.create(principle);
            }
        } catch (err) {
            console.error('Error seeding about principles:', err);
            throw new Error('About principles seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Team Section
        try {
            await AboutPageTeamSection.create({
                title: 'Meet Our Team',
                description: 'Behind every great piece of content is a passionate team of creatives, strategists, and storytellers. Get to know the people who make it all happen.',
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about team section:', err);
            throw new Error('About team section seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed Team Members
        try {
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
                await AboutPageTeamMembers.create(member);
            }
        } catch (err) {
            console.error('Error seeding about team members:', err);
            throw new Error('About team members seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        // Seed CTA Section
        try {
            await AboutPageCTA.create({
                title: 'Ready to Work Together?',
                description: "Let's create content that makes an impact. Get in touch with us today.",
                primary_button_text: 'Get Started',
                primary_button_link: '/contact',
                secondary_button_text: 'Browse Products',
                secondary_button_link: '/midea-ac',
                is_active: 1,
            });
        } catch (err) {
            console.error('Error seeding about CTA:', err);
            throw new Error('About CTA seeding failed: ' + (err instanceof Error ? err.message : String(err)));
        }

        return NextResponse.json(
            {
                success: true,
                message: 'About page seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding about page:', error);

        // Try to extract which subsection failed from the thrown message (we throw 'About <section> seeding failed: ...')
        let section: string | undefined = undefined;
        if (error instanceof Error) {
            const m = error.message.match(/^About\s+([\w\s]+)\s+seeding failed/i);
            if (m) section = m[1].trim();
        }

        return NextResponse.json(
            {
                error: 'Failed to seed about page',
                section,
                details: error instanceof Error ? error.message : 'Unknown error',
                // include the stack only in development for easier debugging
                stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
