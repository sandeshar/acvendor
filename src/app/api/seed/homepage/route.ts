import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    HomepageHero,
    HomepageTrustSection,
    HomepageTrustLogos,
    HomepageExpertiseSection,
    HomepageExpertiseItems,
    HomepageContactSection
} from '@/db/homepageSchema';

export async function POST() {
    try {
        await connectDB();

        // Clear existing data
        await HomepageHero.deleteMany({});
        await HomepageTrustSection.deleteMany({});
        await HomepageTrustLogos.deleteMany({});
        await HomepageExpertiseSection.deleteMany({});
        await HomepageExpertiseItems.deleteMany({});
        await HomepageContactSection.deleteMany({});

        // Seed Hero Section
        await HomepageHero.create({
            title: 'AC Vendor — Trusted Air Conditioners & Parts',
            subtitle: 'High-efficiency AC units, professional installation, and reliable after-sales support — all in one place.',
            cta_text: 'Shop Now',
            cta_link: '/midea-ac',
            background_image: 'https://images.unsplash.com/photo-1592854936919-59d5e9f6f2a3?auto=format&fit=crop&w=1400&q=80',
            hero_image_alt: 'Modern air conditioning units in a showroom',
            badge_text: 'Free installation on select models',
            highlight_text: 'Reliable Cooling',
            colored_word: 'Cooling',
            float_top_enabled: 1,
            float_top_icon: 'local_shipping',
            float_top_title: 'Fast Delivery',
            float_top_value: 'Ships in 2-3 days',
            float_bottom_enabled: 1,
            float_bottom_icon: 'verified',
            float_bottom_title: 'Warranty',
            float_bottom_value: 'Up to 5 years',
            secondary_cta_text: 'Browse Brands',
            secondary_cta_link: '/brands',
            rating_text: 'Top rated by homeowners',
            is_active: 1,
        });

        // Seed Trust Section
        await HomepageTrustSection.create({
            heading: 'TRUSTED BY INDUSTRY LEADERS',
            is_active: 1,
        });

        // Seed Trust Logos
        const trustLogos = [
            {
                alt_text: 'Company logo 1',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdE09VxvThX9dMNU-y7liJUYJQgy2M5kHpRY3-KBAi3T15rFrOZlsQl9AuunBzn1Aq6C31_7zK1sJ1mAbEl5KpzCMhGYsp4jkN8mieRiPdmg5nH_jDImPk68z5HRT6Os3gAMfMfMrtjQMryIqSDjRmFZJn9wE3gKgrYuTpfKQvd0b88HdscP3HxgbCc2iriByk-7lfePm1azfmpfR9qhb9r71__imvkKhnrgKAb8kV8wAA8RrLtRLCzIArOEr0GdFaTXKQDrmUG94',
                invert: 0,
                display_order: 1,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 2',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiuaY0NEU5wLpIqRHE4OZ5puZNZoTQMtWdW1UkBjgSLQDo3b8Ih6zxn7rFnEvsQGGV9aOfACRC2c8LyBcfr31GFosqo9VIjHKW9DzxsOQQ4MOJw4uScNYYo57AITdg3-b-Lkl-JNRgFAx_tPKqjPd3f1YvnxrpIZ9kQWpCEcEsrz3vGsMFh9GyIMZ2Rj9HGTIX7HpKz0dXUBK7N93uFL-tmT1b0I_gy8n_U0GfL_AK_tjcR1fj6FqIi77-FNl9ALBkqSEySdytLYk',
                invert: 1,
                display_order: 2,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 3',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwfDCwC7gEV6oG6iFk56oYq6vfS2XEaJi0jDS9H77m7JcCvi9MRO_6VYnFcndlIjLv79dJDRA4BRY0z5ZDg9gaI8zgSa5-08-kU9uuJOAzJGRWhGMIM-22RhM7fyARxN_d85K01aKNMWrHvwFhQVZ-PQGInoNJ_ywq14zAE1rdxlUxppldx0UF9B-94CN69tcMUx2o_iLrv7PsPH2UcH-XtGvGb3b6Mny0ODMhO_GHsjd9KKcWR3dgOuD8XObd-wMrohWQQjSWZ84',
                invert: 1,
                display_order: 3,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 4',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBROPSD5QVXLyvnJXrkV33ahL2cpAo6arKuy59mo5nBmgJaLONI-m2XZ9n8PbkvLoDPTOwAmyMgFvmlXS35o9EYiDyisdt7tmG39FlKPKu84ZPHQ5OQMMIYcMK3WKDav-FZiv9Wig0XkT5zLecd7nCWmYYJvUK8YRJ-ylWhAjgPo1tElJJLgLqhdcEpPCQc6jZn5SFOteE4MmTC9o_jwYhFRq13Yj3ko76EBPa2sYpyZFqjpkazjW0mAg-MPOOzFnl0i94K8kgiBf4',
                invert: 1,
                display_order: 4,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 5',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbCrAkF3_ZYrgIMN96U-oWHbnq8iE__GncAFNokxSq0dPVR6XaqsOQvWaiRxy62Pxt83dC3Vp2wErYBuLpvpWV_cdaygkliysA6ilXZX2BAv1M6HCcZ_50BkEhVadLWOy0-tajzgz8xS4t3EdWtqSx7qYe-Zexm5W3AbbD0BeF3iMCx6BuDoe7RFqlg8T8auS4E7u4iPEuuzbmZ8-avIx66uTyVZ0DXRXCK9wdrFW8KNlWJKTujcomnB5nNN91c1PYLt4qoUTCF1c',
                invert: 1,
                display_order: 5,
                is_active: 1,
            },
            {
                alt_text: 'Company logo 6',
                logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU_UaDS2_SBIBZRcjgqlJM-IduY8WarSSAB_GhjJa2pCIjPgesG0X3akXa8tAVJxrZYBdPHGjw4EMqVDg3YIncnbIcVGpvx1C-mGWzJ9_M1Vv_0oi3c5NrK90gb85aQVFkzuXYCLDt6RDC8p3ZWW1TcwTCNslbCUgQ8fG7sGXieMY3i0Xz_v--PHarp8MuGmKb6vySnIg_edXfT8KHnBY8V34chuZAzQpNcs-HSeEnu6zVC0QUnM_hvWV-2fCpSXzHXkHlt9BCNeA',
                invert: 1,
                display_order: 6,
                is_active: 1,
            },
        ];

        for (const logo of trustLogos) {
            await HomepageTrustLogos.create(logo);
        }

        // Seed Expertise Section
        await HomepageExpertiseSection.create({
            title: 'Why Shop With Us',
            description: 'Quality AC units, professional installation, and trusted after-sales service tailored for homes and businesses.',
            is_active: 1,
        });

        // Seed Expertise Items
        const expertiseItems = [
            {
                icon: 'inventory_2',
                title: 'Wide Selection',
                description: 'Split, window, inverter, and commercial ACs from leading brands.',
                display_order: 1,
                is_active: 1,
            },
            {
                icon: 'home_repair_service',
                title: 'Professional Installation',
                description: 'Certified technicians for safe and efficient setup.',
                display_order: 2,
                is_active: 1,
            },
            {
                icon: 'verified',
                title: 'Extended Warranty',
                description: 'Warranty plans up to 5 years for peace of mind.',
                display_order: 3,
                is_active: 1,
            },
            {
                icon: 'local_shipping',
                title: 'Fast Shipping & Support',
                description: 'Quick delivery and responsive customer service.',
                display_order: 4,
                is_active: 1,
            },
        ];

        for (const item of expertiseItems) {
            await HomepageExpertiseItems.create(item);
        }

        // Seed Contact Section
        await HomepageContactSection.create({
            title: 'Need Help Choosing?',
            description: "Our support team can help you pick the right AC and schedule installation. Fill out the form and we'll respond within 24 hours.",
            name_placeholder: 'Your Name',
            email_placeholder: 'Your Email',
            phone_placeholder: 'Phone Number',
            service_placeholder: 'Choose a service (e.g., installation, warranty)',
            message_placeholder: 'How can we help?',
            submit_button_text: 'Contact Support',
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
