import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
    homepageHero,
    homepageTrustSection,
    homepageTrustLogos,
    homepageExpertiseSection,
    homepageExpertiseItems,
    homepageContactSection
} from '@/db/homepageSchema';

export async function POST() {
    try {
        // Clear existing data
        await db.delete(homepageHero);
        await db.delete(homepageTrustSection);
        await db.delete(homepageTrustLogos);
        await db.delete(homepageExpertiseSection);
        await db.delete(homepageExpertiseItems);
        await db.delete(homepageContactSection);

        // Seed Hero Section
        await db.insert(homepageHero).values({
            title: 'Drive Real Business Growth Through Powerful Content',
            subtitle: 'We craft content strategies that captivate your audience, boost your rankings, and convert readers into loyal customers.',
            cta_text: 'Schedule a Free Consultation',
            cta_link: '/contact',
            background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_ntBsh0ac8NNu4CDZ0OwptNX4TckC0Vk370Stu-5ncnvdbLPszfUWx1G4Vbyynsp7G1IukNqM2ARj6R242IPtABbGqsoHea3IRXWJjfZy8v0YwvghTSdy3UYS0ViJGsCxmB3Jua3jm3Nmz5ZA2yh5p70-qFmtfPdmvtc7WyY0gauc1eQ0Hc20w96-OEQp1WkX_IMlpkYEhv___4podpWVNeJtiFPjhpMwNu1nIMzW0bcH_-R-luLL4KVRpHNF93ktX31uFGTKMXk',
            hero_image_alt: 'Hero background showing team collaboration',
            badge_text: 'Accepting new projects',
            highlight_text: 'Powerful Content',
            colored_word: '',
            float_top_enabled: 1,
            float_top_icon: 'trending_up',
            float_top_title: 'Growth',
            float_top_value: '+240% ROI',
            float_bottom_enabled: 1,
            float_bottom_icon: 'check_circle',
            float_bottom_title: 'Ranking',
            float_bottom_value: '#1 Result',
            secondary_cta_text: 'View Our Work',
            secondary_cta_link: '/work',
            rating_text: 'Trusted by modern teams',
            is_active: 1,
        });

        // Seed Trust Section
        await db.insert(homepageTrustSection).values({
            heading: 'TRUSTED BY INDUSTRY LEADERS',
            is_active: 1,
        });

        // Seed Trust Logos
        const trustLogos = [
            {
                alt_text: 'Company logo 1',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdE09VxvThX9dMNU-y7liJUYJQgy2M5kHpRY3-KBAi3T15rFrOZlsQl9AuunBzn1Aq6C31_7zK1sJ1mAbEl5KpzCMhGYsp4jkN8mieRiPdmg5nH_jDImPk68z5HRT6Os3gAMfMfMrtjQMryIqSDjRmFZJn9wE3gKgrYuTpfKQvd0b88HdscP3HxgbCc2iriByk-7lfePm1azfmpfR9qhb9r71__imvkKhnrgKAb8kV8wAA8RrLtRLCzIArOEr0GdFaTXKQDrmUG94',
                dark_invert: 0,
                display_order: 1,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 2',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiuaY0NEU5wLpIqRHE4OZ5puZNZoTQMtWdW1UkBjgSLQDo3b8Ih6zxn7rFnEvsQGGV9aOfACRC2c8LyBcfr31GFosqo9VIjHKW9DzxsOQQ4MOJw4uScNYYo57AITdg3-b-Lkl-JNRgFAx_tPKqjPd3f1YvnxrpIZ9kQWpCEcEsrz3vGsMFh9GyIMZ2Rj9HGTIX7HpKz0dXUBK7N93uFL-tmT1b0I_gy8n_U0GfL_AK_tjcR1fj6FqIi77-FNl9ALBkqSEySdytLYk',
                dark_invert: 1,
                display_order: 2,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 3',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwfDCwC7gEV6oG6iFk56oYq6vfS2XEaJi0jDS9H77m7JcCvi9MRO_6VYnFcndlIjLv79dJDRA4BRY0z5ZDg9gaI8zgSa5-08-kU9uuJOAzJGRWhGMIM-22RhM7fyARxN_d85K01aKNMWrHvwFhQVZ-PQGInoNJ_ywq14zAE1rdxlUxppldx0UF9B-94CN69tcMUx2o_iLrv7PsPH2UcH-XtGvGb3b6Mny0ODMhO_GHsjd9KKcWR3dgOuD8XObd-wMrohWQQjSWZ84',
                dark_invert: 1,
                display_order: 3,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 4',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBROPSD5QVXLyvnJXrkV33ahL2cpAo6arKuy59mo5nBmgJaLONI-m2XZ9n8PbkvLoDPTOwAmyMgFvmlXS35o9EYiDyisdt7tmG39FlKPKu84ZPHQ5OQMMIYcMK3WKDav-FZiv9Wig0XkT5zLecd7nCWmYYJvUK8YRJ-ylWhAjgPo1tElJJLgLqhdcEpPCQc6jZn5SFOteE4MmTC9o_jwYhFRq13Yj3ko76EBPa2sYpyZFqjpkazjW0mAg-MPOOzFnl0i94K8kgiBf4',
                dark_invert: 1,
                display_order: 4,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 5',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbCrAkF3_ZYrgIMN96U-oWHbnq8iE__GncAFNokxSq0dPVR6XaqsOQvWaiRxy62Pxt83dC3Vp2wErYBuLpvpWV_cdaygkliysA6ilXZX2BAv1M6HCcZ_50BkEhVadLWOy0-tajzgz8xS4t3EdWtqSx7qYe-Zexm5W3AbbD0BeF3iMCx6BuDoe7RFqlg8T8auS4E7u4iPEuuzbmZ8-avIx66uTyVZ0DXRXCK9wdrFW8KNlWJKTujcomnB5nNN91c1PYLt4qoUTCF1c',
                dark_invert: 1,
                display_order: 5,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 6',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU_UaDS2_SBIBZRcjgqlJM-IduY8WarSSAB_GhjJa2pCIjPgesG0X3akXa8tAVJxrZYBdPHGjw4EMqVDg3YIncnbIcVGpvx1C-mGWzJ9_M1Vv_0oi3c5NrK90gb85aQVFkzuXYCLDt6RDC8p3ZWW1TcwTCNslbCUgQ8fG7sGXieMY3i0Xz_v--PHarp8MuGmKb6vySnIg_edXfT8KHnBY8V34chuZAzQpNcs-HSeEnu6zVC0QUnM_hvWV-2fCpSXzHXkHlt9BCNeA',
                dark_invert: 1,
                display_order: 6,
                is_active: 1,
            },
        ];

        for (const logo of trustLogos) {
            await db.insert(homepageTrustLogos).values(logo);
        }

        // Seed Expertise Section
        await db.insert(homepageExpertiseSection).values({
            title: 'Our Expertise',
            description: 'From strategy to execution, we provide end-to-end content solutions designed to meet your business objectives.',
            is_active: 1,
        });

        // Seed Expertise Items
        const expertiseItems = [
            {
                icon: 'explore',
                title: 'Content Strategy',
                description: 'Developing a roadmap to create, publish, and govern your content.',
                display_order: 1,
                is_active: 1,
            },
            {
                icon: 'search',
                title: 'SEO Writing',
                description: 'Crafting high-quality content that ranks on search engines and drives organic traffic.',
                display_order: 2,
                is_active: 1,
            },
            {
                icon: 'edit',
                title: 'Copywriting',
                description: 'Writing persuasive copy that converts for your website, ads, and emails.',
                display_order: 3,
                is_active: 1,
            },
            {
                icon: 'group',
                title: 'Social Media Marketing',
                description: 'Engaging your community with compelling content across all social platforms.',
                display_order: 4,
                is_active: 1,
            },
        ];

        for (const item of expertiseItems) {
            await db.insert(homepageExpertiseItems).values(item);
        }

        // Seed Contact Section
        await db.insert(homepageContactSection).values({
            title: 'Ready to Grow Your Business?',
            description: "Let's talk about how our content solutions can help you achieve your goals. Fill out the form, and we'll get back to you within 24 hours.",
            name_placeholder: 'Your Name',
            email_placeholder: 'Your Email',
            phone_placeholder: 'Phone Number',
            service_placeholder: 'Select a service',
            message_placeholder: 'Your Message',
            submit_button_text: 'Get Started',
            is_active: 1,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Homepage seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding homepage:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed homepage',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
