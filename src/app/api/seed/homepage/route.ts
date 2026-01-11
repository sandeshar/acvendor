import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    HomepageHero,
    HomepageTrustSection,
    HomepageTrustLogos,
    HomepageExpertiseSection,
    HomepageExpertiseItems,
    HomepageContactSection,
    HomepageProductsSection,
    HomepageTestimonialsSection,
    HomepageHeroFeatures,
    HomepageBlogSection,
    HomepageAboutSection,
    HomepageAboutItems,
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
        await HomepageProductsSection.deleteMany({});
        await HomepageTestimonialsSection.deleteMany({});
        await HomepageHeroFeatures.deleteMany({});
        await HomepageBlogSection.deleteMany({});
        await HomepageAboutSection.deleteMany({});
        await HomepageAboutItems.deleteMany({});

        // Seed Hero Section
        await HomepageHero.create({
            title: 'Nepal Air Conditioner',
            subtitle: 'Complete HVAC solutions — installation, design, manufacturing, and maintenance across Nepal.',
            cta_text: 'Contact Us',
            cta_link: '/contact',
            background_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
            hero_image_alt: 'Technician installing an air conditioner',
            badge_text: 'Serving Nepal nationwide',
            highlight_text: 'Reliable HVAC Solutions',
            colored_word: 'Nepal',
            trust_badge1_icon: 'local_shipping',
            trust_badge1_text: 'Fast Delivery',
            trust_badge2_icon: 'verified',
            trust_badge2_text: 'Warranty',
            trust_badge3_icon: 'engineering',
            trust_badge3_text: 'Expert Techs',
            secondary_cta_text: 'Our Services',
            secondary_cta_link: '/services',
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
            about_heading: 'About Us',
            about_paragraph: '<p>We are committed to providing top-notch air conditioning solutions tailored to your needs. Reach out to us for inquiries, support, or to schedule a service.</p>',
            name_placeholder: 'Your Name',
            email_placeholder: 'Your Email',
            phone_placeholder: 'Phone Number',
            service_placeholder: 'Choose a service (e.g., installation, warranty)',
            message_placeholder: 'How can we help?',
            submit_button_text: 'Contact Support',
            cta_text: 'Learn More',
            cta_link: '/about',
            cta_style: 'arrow',
            is_active: 1,
        });

        // Seed Products Section
        await HomepageProductsSection.create({
            title: 'Featured Products',
            description: 'Browse our selection of top-rated air conditioning units and accessories.',
            is_active: 1,
        });

        // Seed Testimonials Section
        await HomepageTestimonialsSection.create({
            title: "Don't Just Take Our Word For It",
            subtitle: 'Here are a few kind words from our satisfied customers.',
            is_active: 1,
        });

        // Seed About / First Page Content
        await HomepageAboutSection.create({
            title: 'Home Page First Page Content',
            description: 'Nepal Air Conditioner provides a wide range of HVAC services and solutions tailored for homes, businesses, and industrial needs.',
            bullets: JSON.stringify([
                'Residential Air Conditioners',
                'Commercial HVAC System',
                'HVAC Engineering / AutoCAD Design',
                'HVAC System Installation',
                'HVAC Repair & Maintenance',
                'Cold Room Manufacturing',
                'Heat Pump System',
                'Annual Maintenance Contract (AMC)',
            ]),
            image_url: 'https://images.unsplash.com/photo-1581094162769-4b5b6d99a7c6?auto=format&fit=crop&w=1200&q=80',
            image_alt: 'HVAC systems and engineers working',
            cta_text: 'Learn More',
            cta_link: '/services',
            is_active: 1,
        });

        // Seed About Items (services)
        const aboutItems = [
            {
                title: 'Residential Air Conditioners',
                description: 'Energy-efficient AC units and professional installation for homes.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1582719478250-7e5b49b8d6c3?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Residential air conditioner installed in a living room',
                display_order: 1,
                is_active: 1,
            },
            {
                title: 'Commercial HVAC System',
                description: 'Design, supply and install HVAC systems for commercial buildings.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1592854936919-59d5e9f6f2a3?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Commercial HVAC ductwork and units',
                display_order: 2,
                is_active: 1,
            },
            {
                title: 'HVAC Engineering / AutoCAD Design',
                description: 'Detailed HVAC layouts and AutoCAD designs by experienced engineers.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Engineer reviewing HVAC schematics on a computer',
                display_order: 3,
                is_active: 1,
            },
            {
                title: 'HVAC System Installation',
                description: 'Full installation services following best practices and safety standards.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Technician installing an air conditioner',
                display_order: 4,
                is_active: 1,
            },
            {
                title: 'HVAC Repair & Maintenance',
                description: 'Expert troubleshooting, repairs and preventive maintenance services.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Technician performing AC maintenance',
                display_order: 5,
                is_active: 1,
            },
            {
                title: 'Cold Room Manufacturing',
                description: 'Custom cold room design and manufacturing for storage solutions.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1549399546-9d4d5f5d93d0?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Industrial cold room interior',
                display_order: 6,
                is_active: 1,
            },
            {
                title: 'Heat Pump System',
                description: 'Efficient heat pump solutions for heating and cooling needs.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1582719478250-1a1285b6b2f1?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Heat pump unit outside a building',
                display_order: 7,
                is_active: 1,
            },
            {
                title: 'Annual Maintenance Contract (AMC)',
                description: 'Comprehensive AMC plans to keep your systems running reliably year-round.',
                bullets: '[]',
                image_url: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
                image_alt: 'Technician checklist for maintenance',
                display_order: 8,
                is_active: 1,
            },
        ];

        for (const item of aboutItems) {
            await HomepageAboutItems.create(item);
        }

        // Seed Hero Features (floating cards)
        const heroFeatures = [
            { icon_name: 'local_shipping', icon_bg: 'bg-blue-600', title: 'Fast Delivery', description: 'Timely delivery across Nepal.', display_order: 1, is_active: 1 },
            { icon_name: 'engineering', icon_bg: 'bg-green-600', title: 'Expert Technicians', description: 'Certified HVAC technicians for installation & repair.', display_order: 2, is_active: 1 },
            { icon_name: 'verified', icon_bg: 'bg-orange-600', title: 'Warranty Plans', description: 'Extended warranty and parts support.', display_order: 3, is_active: 1 },
            { icon_name: 'support_agent', icon_bg: 'bg-indigo-600', title: '24/7 Support', description: 'Round-the-clock assistance for service requests.', display_order: 4, is_active: 1 },
        ];

        for (const f of heroFeatures) {
            await HomepageHeroFeatures.create(f);
        }

        // Seed Blog Section
        await HomepageBlogSection.create({
            title: 'From Our Blog',
            subtitle: 'Tips and updates on HVAC systems, energy savings, and product guides.',
            cta_text: 'Read All Posts',
            cta_link: '/blog',
            is_active: 1,
        });

        // Seed a couple of sample blog posts (if not present)
        try {
            const { BlogPost, User, Status } = await import('@/db/schema');
            const firstUser = await User.findOne().lean();
            const statusRows = await Status.find().lean();
            const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

            if (firstUser && publishedStatus) {
                const samplePosts = [
                    { slug: 'how-to-choose-ac', title: 'How to Choose the Right AC for Your Home', content: '<p>Choosing the right AC depends on room size, insulation, and usage patterns...</p>', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', metaTitle: 'Choose Right AC', metaDescription: 'Practical tips to pick the best air conditioner.' },
                    { slug: 'ac-maintenance-checklist', title: 'AC Maintenance Checklist: Keep Your Unit Running Smoothly', content: '<p>Regular maintenance increases efficiency and prevents costly repairs...</p>', thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80', metaTitle: 'AC Maintenance', metaDescription: 'Checklist for annual AC maintenance.' },
                ];

                for (const p of samplePosts) {
                    const existing = await BlogPost.findOne({ slug: p.slug }).lean();
                    if (!existing) {
                        await BlogPost.create({
                            slug: p.slug,
                            title: p.title,
                            content: p.content,
                            thumbnail: p.thumbnail,
                            metaTitle: p.metaTitle,
                            metaDescription: p.metaDescription,
                            authorId: firstUser._id,
                            status: publishedStatus._id,
                        });
                    }
                }
            }
        } catch (e) {
            // Non-fatal, blog posts optional
            console.warn('Could not seed sample blog posts', e);
        }

        // Seed sample testimonials
        try {
            const { ReviewTestimonials } = await import('@/db/reviewSchema');
            const sampleTestimonials = [
                { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', name: 'Ramesh Thapa', role: 'Homeowner', content: 'Prompt service and professional installation — highly recommended!', rating: 5, link: 'homepage' },
                { url: 'https://images.unsplash.com/photo-1545996124-1f7b7f8b1d02?auto=format&fit=crop&w=400&q=80', name: 'Sita Gurung', role: 'Business Owner', content: 'Reliable maintenance contract and excellent responsiveness.', rating: 5, link: 'homepage' },
            ];

            for (const t of sampleTestimonials) {
                await ReviewTestimonials.create(t);
            }
        } catch (e) {
            // Non-fatal
            console.warn('Could not seed testimonials', e);
        }

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
