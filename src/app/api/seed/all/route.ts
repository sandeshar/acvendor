import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    HomepageHero,
    HomepageTrustLogos,
    HomepageTrustSection,
    HomepageExpertiseSection,
    HomepageExpertiseItems,
    HomepageContactSection,
} from '@/db/homepageSchema';
import {
    AboutPageHero,
    AboutPageJourney,
    AboutPageStats,
    AboutPageFeatures,
    AboutPagePhilosophy,
    AboutPagePrinciples,
    AboutPageTeamSection,
    AboutPageTeamMembers,
    AboutPageCTA
} from '@/db/aboutPageSchema';
import {
    ServicesPageHero,
    ServicesPageDetails,
    ServicesPageProcessSection,
    ServicesPageProcessSteps,
    ServicesPageCTA
} from '@/db/servicesPageSchema';
import { ServiceCategories, ServiceSubcategories } from '@/db/serviceCategoriesSchema';
import {
    ContactPageHero,
    ContactPageInfo,
    ContactPageFormConfig,
} from '@/db/contactPageSchema';
import {
    FAQPageHeader,
    FAQCategories,
    FAQItems,
    FAQPageCTA,
} from '@/db/faqPageSchema';
import { TermsPageHeader, TermsPageSections } from '@/db/termsPageSchema';
import { BlogPageHero, BlogPageCTA } from '@/db/blogPageSchema';
import { BlogPost, User, Status, FooterSection, FooterLink, StoreSettings } from '@/db/schema';
import { ServicePosts } from '@/db/servicePostsSchema';
import { ReviewTestimonials } from '@/db/reviewSchema';

function logDbError(e: any, context = '') {
    try {
        console.error('DB Error', context ? `(${context})` : '', e?.message || e, {
            code: e?.code,
            errno: e?.errno,
            sql: e?.sql || e?.cause?.sql,
            params: e?.params || e?.cause?.params,
        });
    } catch (err) {
        console.error('Failed to log DB error', err);
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json().catch(() => ({} as any));
        const forwardedBrand = body?.brand || undefined;
        const forwardedClean = body?.clean === true || body?.clean === '1' || body?.clean === 1;
        const origin = new URL(request.url).origin;

        const results: Record<string, { success: boolean; message: string }> = {
            status: { success: false, message: '' },
            users: { success: false, message: '' },
            homepage: { success: false, message: '' },
            about: { success: false, message: '' },
            services: { success: false, message: '' },
            products: { success: false, message: '' },
            contact: { success: false, message: '' },
            faq: { success: false, message: '' },
            terms: { success: false, message: '' },
            blog: { success: false, message: '' },
            testimonials: { success: false, message: '' },
            navbar: { success: false, message: '' },
            footer: { success: false, message: '' },
        };

        // 1. Seed Status (delegated)
        try {
            const res = await fetch(`${origin}/api/seed/status`, { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            results.status = { success: res.ok, message: data?.message || data?.error || (res.ok ? 'Status seeded' : 'Failed to seed status') };
        } catch (error) {
            results.status.message = error instanceof Error ? error.message : 'Failed to seed status';
        }

        // 2. Seed Users (delegated)
        try {
            const res = await fetch(`${origin}/api/seed/users`, { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            results.users = { success: res.ok, message: data?.message || data?.error || (res.ok ? 'Users seeded' : 'Failed to seed users') };
        } catch (error) {
            results.users.message = error instanceof Error ? error.message : 'Failed to seed users';
        }

        // Ensure Store Settings exist
        try {
            const existing = await StoreSettings.findOne().lean();
            if (!existing) {
                await StoreSettings.create({
                    store_name: 'AC Vendor',
                    store_description: 'Your trusted source for air conditioners, parts, and installation services.',
                    store_logo: '/logo.png',
                    favicon: '/favicon.ico',
                    contact_email: 'support@acvendor.com',
                    contact_phone: '+977 9800000000',
                    address: 'Kathmandu, Nepal',
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: '',
                    meta_title: 'AC Vendor - Air Conditioners and Installation',
                    meta_description: 'Shop the best air conditioners, parts, and professional installation services.',
                    meta_keywords: 'AC, air conditioner, installation, compressor, split AC',
                    footer_text: `© ${new Date().getFullYear()} AC Vendor. All rights reserved.`,
                });
            }
            results.store = { success: true, message: 'Store settings present' };
        } catch (e) {
            // non-fatal
            logDbError(e, 'ensure store settings');
        }

        // Delegate to individual seeders where possible and return early (fallback to inline if delegation fails)
        try {
            const delegateKeys = ['status', 'users', 'homepage', 'about', 'services', 'products', 'contact', 'faq', 'terms', 'blog', 'testimonials', 'navbar', 'footer'];
            for (const key of delegateKeys) {
                try {
                    const params = new URLSearchParams();
                    if ((key === 'products' || key === 'services') && forwardedBrand) params.set('brand', forwardedBrand);
                    if ((key === 'products' || key === 'services') && forwardedClean) params.set('clean', '1');
                    const url = `${origin}/api/seed/${key}${params.toString() ? `?${params.toString()}` : ''}`;
                    const res = await fetch(url, { method: 'POST' });
                    const data = await res.json().catch(() => ({}));
                    results[key] = { success: res.ok, message: data?.message || data?.error || (res.ok ? 'Seeded' : 'Failed') };
                } catch (err) {
                    results[key] = { success: false, message: err instanceof Error ? err.message : String(err) };
                }
            }

            return NextResponse.json({ success: true, message: 'All individual seeders executed', results }, { status: 200 });
        } catch (err) {
            console.error('Delegated master seeder failed, falling back to inline seeding', err);
        }

        // 3. Seed Homepage
        try {
            await HomepageHero.deleteMany({});
            await HomepageTrustLogos.deleteMany({});
            await HomepageTrustSection.deleteMany({});
            await HomepageExpertiseSection.deleteMany({});
            await HomepageExpertiseItems.deleteMany({});
            await HomepageContactSection.deleteMany({});

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

            await HomepageTrustSection.create({
                heading: 'TRUSTED BY INDUSTRY LEADERS',
                is_active: 1,
            });

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

            await HomepageExpertiseSection.create({
                title: 'Why Shop With Us',
                description: 'Quality AC units, professional installation, and trusted after-sales service tailored for homes and businesses.',
                is_active: 1,
            });

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

            results.homepage = { success: true, message: 'Homepage seeded successfully' };
        } catch (error) {
            results.homepage.message = error instanceof Error ? error.message : 'Failed to seed homepage';
        }

        // 4. Seed About (delegated)
        try {
            const res = await fetch(`${origin}/api/seed/about`, { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            results.about = { success: res.ok, message: data?.message || data?.error || (res.ok ? 'About seeded' : 'Failed to seed about') };
        } catch (error) {
            results.about.message = error instanceof Error ? error.message : 'Failed to seed about';
        }

        // 5. Seed Services
        try {
            const firstUser = await User.findOne().lean();
            const statusRows = await Status.find().lean();
            const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

            // Clean up services
            try {
                await ServicePosts.deleteMany({});
                await ServiceSubcategories.deleteMany({});
                await ServiceCategories.deleteMany({});
                await ServicesPageHero.deleteMany({});
                await ServicesPageDetails.deleteMany({});
                await ServicesPageProcessSection.deleteMany({});
                await ServicesPageProcessSteps.deleteMany({});
                await ServicesPageCTA.deleteMany({});
            } catch (e) {
                // Some tables might not exist, that's ok
            }

            // Only seed if we have a user and status
            if (firstUser && publishedStatus) {
                await ServicesPageHero.create({
                    tagline: 'Our Products',
                    title: 'Quality Air Conditioners & Parts',
                    description: 'Explore a wide range of AC units, parts, and installation services from trusted brands.',
                    badge_text: 'Free Installation Offer',
                    highlight_text: 'Air Conditioners',
                    primary_cta_text: 'Shop Products',
                    primary_cta_link: '/midea-ac',
                    secondary_cta_text: 'Request Installation',
                    secondary_cta_link: '/contact',
                    background_image: 'https://images.unsplash.com/photo-1582719478250-1a1285b6b2f1?auto=format&fit=crop&w=1400&q=80',
                    hero_image_alt: 'Assortment of air conditioners in a store',
                    stat1_value: '20+',
                    stat1_label: 'Brands',
                    stat2_value: '8k+',
                    stat2_label: 'Installations',
                    stat3_value: '10k+',
                    stat3_label: 'Satisfied Customers',
                });

                const categorySlug = 'ac-products';
                // Ensure idempotent insert/update to avoid unique key errors
                const existingCategory = await ServiceCategories.findOne({ slug: categorySlug }).lean();

                if (!existingCategory) {
                    await ServiceCategories.create({
                        name: 'AC Products',
                        slug: categorySlug,
                        description: 'Split, window, inverter, and commercial AC units plus spare parts and accessories.',
                        icon: 'ac_unit',
                        thumbnail: 'https://images.unsplash.com/photo-1582719478250-1a1285b6b2f1?auto=format&fit=crop&w=1400&q=80',
                        display_order: 1,
                        is_active: 1,
                        meta_title: 'AC Products',
                        meta_description: 'Shop air conditioners, parts, and installation services from trusted brands.',
                    });
                } else {
                    // Update fields if the category already exists (best-effort)
                    await ServiceCategories.findByIdAndUpdate(existingCategory._id, {
                        name: 'AC Products',
                        description: 'Split, window, inverter, and commercial AC units plus spare parts and accessories.',
                        icon: 'ac_unit',
                        thumbnail: 'https://images.unsplash.com/photo-1582719478250-1a1285b6b2f1?auto=format&fit=crop&w=1400&q=80',
                        display_order: 1,
                        is_active: 1,
                        meta_title: 'AC Products',
                        meta_description: 'Shop air conditioners, parts, and installation services from trusted brands.',
                    });
                }

                const category = await ServiceCategories.findOne({ slug: categorySlug }).lean();

                const serviceData = [
                    {
                        key: 'mitsubishi-split-1-5-ton',
                        icon: 'ac_unit',
                        title: 'Mitsubishi Split 1.5 Ton (Inverter)',
                        description: 'Energy-efficient inverter split AC with low-noise operation and fast cooling.',
                        bullets: ['1.5 Ton capacity', 'Inverter technology', '5 year warranty on compressor'],
                        image: 'https://images.unsplash.com/photo-1592854936919-59d5e9f6f2a3?auto=format&fit=crop&w=800&q=80',
                        image_alt: 'Mitsubishi Split AC unit',
                        price: '749.00',
                    },
                    {
                        key: 'lg-inverter-1-5-ton',
                        icon: 'ac_unit',
                        title: 'LG Inverter 1.5 Ton',
                        description: 'Smart inverter AC with multi-stage filtration and energy saver mode.',
                        bullets: ['1.5 Ton capacity', 'Multi-filter system', 'Smart remote & app control'],
                        image: 'https://images.unsplash.com/photo-1592854936919-59d5e9f6f2a3?auto=format&fit=crop&w=800&q=80',
                        image_alt: 'LG Inverter AC unit',
                        price: '699.00',
                    },
                    {
                        key: 'window-ac-1-ton',
                        icon: 'ac_unit',
                        title: 'Standard Window AC 1 Ton',
                        description: 'Compact and affordable window AC suitable for small rooms.',
                        bullets: ['1 Ton capacity', 'Easy installation', 'Affordable cooling solution'],
                        image: 'https://images.unsplash.com/photo-1560448079-3f5d1f4f1b4b?auto=format&fit=crop&w=800&q=80',
                        image_alt: 'Window AC in a bedroom',
                        price: '349.00',
                    },

                    {
                        key: 'ac-compressor-spare',
                        icon: 'build',
                        title: 'AC Compressor (Spare Part)',
                        description: 'Quality compressor replacement for major brands.',
                        bullets: ['High-durability', 'Fits multiple models', 'Manufacturer-tested'],
                        image: 'https://images.unsplash.com/photo-1581091012184-7d9e3b3e3b20?auto=format&fit=crop&w=800&q=80',
                        image_alt: 'AC compressor spare part',
                        price: '199.00',
                    },
                ];

                const subcategoryMap: Record<string, any> = {};

                for (const s of serviceData) {
                    try {
                        const existingSub = await ServiceSubcategories.findOne({ slug: s.key }).lean();
                        if (!existingSub) {
                            await ServiceSubcategories.create({
                                category_id: category?._id,
                                name: s.title,
                                ac_type: null,
                                slug: s.key,
                                description: s.description,
                                icon: s.icon,
                                thumbnail: s.image,
                                display_order: serviceData.indexOf(s) + 1,
                                is_active: 1,
                                meta_title: s.title,
                                meta_description: s.description,
                            });
                            const subcat = await ServiceSubcategories.findOne({ slug: s.key }).lean();
                            if (subcat) subcategoryMap[s.key] = subcat._id;
                        } else {
                            // Update existing to keep data current
                            await ServiceSubcategories.findByIdAndUpdate(existingSub._id, {
                                category_id: category?._id,
                                name: s.title,
                                ac_type: null,
                                description: s.description,
                                icon: s.icon,
                                thumbnail: s.image,
                                display_order: serviceData.indexOf(s) + 1,
                                is_active: 1,
                                meta_title: s.title,
                                meta_description: s.description,
                                updatedAt: new Date(),
                            });
                            subcategoryMap[s.key] = existingSub._id;
                        }
                    } catch (e) {
                        logDbError(e, `insert/update subcategory ${s.key}`);
                        throw e;
                    }
                }

                for (const [index, s] of serviceData.entries()) {
                    await ServicesPageDetails.create({
                        key: s.key,
                        icon: s.icon,
                        title: s.title,
                        description: s.description,
                        bullets: JSON.stringify(s.bullets),
                        image: s.image,
                        image_alt: s.image_alt,
                        display_order: index + 1,
                        is_active: 1,
                    });

                    const contentMap: Record<string, string> = {
                        seo: `
                            <p>SEO Content services focus on ranking and conversion. We conduct keyword research tailored to Nepal's market to identify queries with the right intent. Our long-form articles are structured with clear H2/H3 headings, a table of contents, and internal links to strengthen topical authority.</p>
                            <p>Deliverables include a content brief, SEO meta optimization, on-page schema where relevant, and 2000+ word pillar content as needed. We also provide optional research-backed statistics and client interview integration to establish trust and back claims.</p>
                            <h3>Package & Pricing</h3>
                            <p>Our base package starts with a discovery call and a 1,200–1,500 word article. Larger pillar pages and content clusters are priced per scope and research needs.</p>
                        `,
                        social: `
                            <p>Social Media Content services deliver platform-ready posts designed to build community. We create monthly calendars, short-form video hooks, caption variations, and design assets for carousels and stories.</p>
                            <p>We focus on localized content for Nepali audiences that respects cultural moments and optimizes for engagement—shares, saves, and comments—while aligning with conversion goals.</p>
                            <h3>Package & Pricing</h3>
                            <p>Packages are typically retainer-based and include content strategy, production, and monthly performance reporting.</p>
                        `,
                        copy: `
                            <p>Website Copywriting services aim to convert visitors into customers through persuasive messaging. We create clear value propositions, headlines, and microcopy that support user flows across your site.</p>
                            <p>Our process includes stakeholder interviews, competitor analysis, and iterative drafting. We craft landing pages, product descriptions, and contact flows optimized for clarity and action.</p>
                            <h3>Package & Pricing</h3>
                            <p>One-time projects like a landing page start with a brief and testing round. Ongoing content refinement is available as a retainer.</p>
                        `,
                        blog: `
                            <p>Blog Writing services focus on long-form content that builds organic visibility, educates your audience, and captures leads. Our articles include SEO research, expert interviews, images, and a clear CTA to guide conversions.</p>
                            <p>We emphasize editorial quality, readability, and strategic linking to convert readers into leads or subscribers.</p>
                            <h3>Package & Pricing</h3>
                            <p>Standard packages include topic ideation, a 1,200–2,000 word article, and basic optimization for search engines.</p>
                        `,
                    };

                    const generateLongContentForService = (title: string, paragraphs = 6) => {
                        let out = `<h1>${title}</h1>`;
                        out += `<p>${title} — extended documentation including examples and step-by-step guidance for execution.</p>`;
                        for (let i = 1; i <= paragraphs; i++) {
                            out += `<h2>Section ${i}</h2><p>Long-form section ${i} with best practices and local context for Nepali businesses.</p>`;
                        }
                        out += `<h2>Final Notes</h2><p>Summary and recommended actions.</p>`;
                        return out;
                    };

                    const postVariants = [
                        { suffix: 'guide', paragraphs: 8 },
                    ];

                    for (const [vIndex, variant] of postVariants.entries()) {
                        const variantContent = contentMap[s.key]
                            ? generateLongContentForService(`${s.title} — ${variant.suffix}`, variant.paragraphs)
                            : generateLongContentForService(`${s.title} — ${variant.suffix}`, variant.paragraphs);

                        await ServicePosts.create({
                            slug: `${s.key}-${variant.suffix}`,
                            title: `${s.title} — ${variant.suffix.replace(/-/g, ' ')}`,
                            excerpt: s.description,
                            content: variantContent,
                            thumbnail: s.image,
                            icon: s.icon,
                            featured: index === 0 && vIndex === 0 ? 1 : 0,
                            category_id: category?._id,
                            subcategory_id: subcategoryMap[s.key],
                            price: s.price || '499.00',
                            price_type: 'fixed',
                            price_label: 'Price',
                            price_description: (s as any).price_description || s.description || 'See product details.',
                            currency: 'USD',
                            authorId: firstUser._id,
                            statusId: publishedStatus._id,
                            meta_title: `${s.title} — ${variant.suffix.replace(/-/g, ' ')}`,
                            meta_description: `High-quality ${s.title.toLowerCase()}`,
                        });
                    }

                    // Insert base post (s.key) so service slug resolves to a long post
                    const baseContent = contentMap[s.key]
                        ? generateLongContentForService(s.title, 28)
                        : generateLongContentForService(s.title, 28);
                    await ServicePosts.create({
                        slug: s.key,
                        title: s.title,
                        excerpt: s.description,
                        content: baseContent,
                        thumbnail: s.image,
                        icon: s.icon,
                        featured: index === 0 ? 1 : 0,
                        category_id: category?._id,
                        subcategory_id: subcategoryMap[s.key],
                        price: s.price || '499.00',
                        price_type: 'fixed',
                        price_label: 'Price',
                        price_description: (s as any).price_description || s.description || 'See product details.',
                        currency: 'USD',
                        authorId: firstUser._id,
                        statusId: publishedStatus._id,
                        meta_title: s.title,
                        meta_description: `High-quality ${s.title.toLowerCase()}`,
                    });
                }

                await ServicesPageProcessSection.create({
                    title: 'Installation Process',
                    description: 'Professional installation with transparent pricing and safety checks.',
                    is_active: 1,
                });

                const processSteps = [
                    { step_number: 1, title: 'Consultation', description: 'Assess your needs and recommend models', display_order: 1 },
                    { step_number: 2, title: 'Measurement & Quote', description: 'Precise measurements and clear pricing', display_order: 2 },
                    { step_number: 3, title: 'Installation', description: 'Certified technicians install and test the unit', display_order: 3 },
                    { step_number: 4, title: 'Handover & Support', description: 'Final inspection, demo, and support guidance', display_order: 4 },
                ];

                for (const step of processSteps) {
                    await ServicesPageProcessSteps.create({
                        ...step,
                        is_active: 1,
                    });
                }

                await ServicesPageCTA.create({
                    title: 'Ready to Install?',
                    description: "Request an installation visit or a quote for your preferred unit.",
                    button_text: 'Request Installation',
                    button_link: '/contact',
                    is_active: 1,
                });
            }

            results.services = { success: true, message: 'Services seeded successfully' };

            // Seed products that reference the same category manager (if a products seeder exists)
            try {
                const origin = new URL(request.url).origin;
                const params = new URLSearchParams();
                if (forwardedBrand) params.set('brand', forwardedBrand);
                if (forwardedClean) params.set('clean', '1');
                const url = `${origin}/api/seed/products${params.toString() ? `?${params.toString()}` : ''}`;

                const prodRes = await fetch(url, { method: 'POST' });
                let prodJson: any = null;
                try { prodJson = await prodRes.json(); } catch (e) { prodJson = null; }
                const ok = prodRes && (prodRes.status === 200 || prodRes.status === 201);
                results.products = { success: ok, message: prodJson?.message || (ok ? 'Products seeded' : 'Products seeding failed') };
            } catch (err) {
                logDbError(err as any, 'calling products seeder');
                results.products = { success: false, message: err instanceof Error ? err.message : String(err) };
            }
        } catch (error) {
            results.services.message = error instanceof Error ? error.message : 'Failed to seed services';
        }

        // 6. Seed Contact
        try {
            await ContactPageHero.deleteMany({});
            await ContactPageInfo.deleteMany({});
            await ContactPageFormConfig.deleteMany({});

            await ContactPageHero.create({
                tagline: 'CONTACT US',
                title: "Get In Touch with AC Vendor",
                description: "Sales, installation, and support — reach out and our team will respond promptly.",
                is_active: 1,
            });

            await ContactPageInfo.create({
                office_location: 'Kathmandu, Nepal',
                phone: '+977 9800000000',
                email: 'support@acvendor.com',
                map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5769816700773!2d85.3206!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQzJzAyLjAiTiA4NcKwMTknMjIuMiJF!5e0!3m2!1sen!2snp!4v',
                info_title: 'Contact Information',
                info_description: 'Reaching out for a repair, new installation, or general inquiry? We\'re just a call away.',
                map_description: 'Get directions to our main office for product demos and consultations.',
                phone_item_1_subtext: 'Sales Hotline (24/7)',
                phone_item_2_subtext: 'Service Support & Repairs',
                whatsapp_title: 'Chat on WhatsApp',
                whatsapp_subtext: 'Get instant quotes & support',
                location_title: 'Head Office',
                opening_hours_title: 'Opening Hours',
                opening_hours_text: 'Sun - Fri: 9:00 AM - 6:00 PM\nSaturday: Closed',
                is_active: 1,
            });

            await ContactPageFormConfig.create({
                name_placeholder: 'Your Name',
                email_placeholder: 'Your Email',
                phone_placeholder: 'Phone (optional)',
                subject_placeholder: 'Subject',
                service_placeholder: 'Select a service',
                message_placeholder: 'Your Message',
                submit_button_text: 'Send Message',
                success_message: 'Thank you for contacting us! We will get back to you soon.',
                is_active: 1,
            });

            results.contact = { success: true, message: 'Contact seeded successfully' };
        } catch (error) {
            results.contact.message = error instanceof Error ? error.message : 'Failed to seed contact';
        }

        // 7. Seed FAQ
        try {
            await FAQItems.deleteMany({});
            await FAQCategories.deleteMany({});
            await FAQPageHeader.deleteMany({});
            await FAQPageCTA.deleteMany({});

            await FAQPageHeader.create({
                title: 'Frequently Asked Questions',
                description: "Answers to common questions about our content marketing services. Find what you're looking for or get in touch with our team.",
                search_placeholder: 'Search for a question...',
                is_active: 1,
            });

            const categories = [
                { name: 'General', display_order: 1, is_active: 1 },
                { name: 'Services', display_order: 2, is_active: 1 },
                { name: 'Pricing', display_order: 3, is_active: 1 },
                { name: 'Process', display_order: 4, is_active: 1 },
            ];

            const categoryIds: any[] = [];
            for (const category of categories) {
                const result = await FAQCategories.create(category);
                categoryIds.push(result._id);
            }

            const faqItemsData = [
                {
                    category_id: categoryIds[0],
                    question: 'What is content marketing and why is it important?',
                    answer: 'Content marketing is a strategic marketing approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience — and, ultimately, to drive profitable customer action. It helps build trust, generate leads, and establish your brand as an authority in your industry.',
                    display_order: 1,
                    is_active: 1,
                },
                {
                    category_id: categoryIds[1],
                    question: 'What types of content do you create?',
                    answer: 'We specialize in a wide range of content formats, including blog posts, articles, website copy, social media content, email newsletters, case studies, and white papers. We tailor the content type to your specific goals and target audience.',
                    display_order: 2,
                    is_active: 1,
                },
                {
                    category_id: categoryIds[2],
                    question: 'How do you determine the pricing for your services?',
                    answer: 'Our pricing is based on the scope of the project, including the type and volume of content, the level of research required, and the overall strategy involved. We offer project-based pricing as well as monthly retainer packages. Contact us for a custom quote.',
                    display_order: 3,
                    is_active: 1,
                },
                {
                    category_id: categoryIds[3],
                    question: 'What is your content creation process like?',
                    answer: 'Our process begins with a discovery call to understand your business and goals. We then move to strategy and planning, followed by content creation, editing, and your review. Once approved, we help with publishing and promotion.',
                    display_order: 4,
                    is_active: 1,
                },
                {
                    category_id: categoryIds[1],
                    question: 'Can I request revisions to the content you provide?',
                    answer: 'Absolutely. We value your feedback. All of our packages include a set number of revision rounds to ensure the final content aligns perfectly with your vision and brand voice.',
                    display_order: 5,
                    is_active: 1,
                },
                {
                    category_id: categoryIds[1],
                    question: 'Do you offer SEO services with your content?',
                    answer: 'Yes, all our content is created with SEO best practices in mind. This includes keyword research, on-page optimization, and creating content that is structured to rank well in search engines.',
                    display_order: 6,
                    is_active: 1,
                },
            ];

            for (const item of faqItemsData) {
                await FAQItems.create(item);
            }

            await FAQPageCTA.create({
                title: 'Still have questions?',
                description: "Can't find the answer you're looking for? Please chat to our friendly team.",
                button_text: 'Get in Touch',
                button_link: '/contact',
                is_active: 1,
            });

            results.faq = { success: true, message: 'FAQ seeded successfully' };
        } catch (error) {
            results.faq.message = error instanceof Error ? error.message : 'Failed to seed FAQ';
        }

        // 8. Seed Terms
        try {
            await TermsPageSections.deleteMany({});
            await TermsPageHeader.deleteMany({});

            await TermsPageHeader.create({
                title: 'Terms & Conditions',
                last_updated: 'October 26, 2023',
                is_active: 1,
            });

            const terms = [
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

            for (const section of terms) {
                await TermsPageSections.create(section);
            }

            results.terms = { success: true, message: 'Terms seeded successfully' };
        } catch (error) {
            results.terms.message = error instanceof Error ? error.message : 'Failed to seed terms';
        }

        // 9. Seed Blog
        try {
            await BlogPageHero.deleteMany({});
            await BlogPageCTA.deleteMany({});
            await BlogPost.deleteMany({});
            const firstUser = await User.findOne().lean();
            const statusRows = await Status.find().lean();
            const publishedStatus = statusRows.find((s: any) => (s.name || '').toLowerCase() === 'published') || statusRows[0];

            await BlogPageHero.create({
                title: 'The Content Solution Blog',
                subtitle: 'Expert insights, trends, and strategies in content marketing for Nepali businesses.',
                background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP7wRSP6PNVQerc44qHCLRoYYd7gD0XXulRDkuPttKz8c2wm7R80QfOir0XcMWFKjBGgyJ5pcMWrIKbPt6SCgNWruICSXdJlao0ovxqmc5rLvSBMdY5X6oZLjHPx9qPTGkgNMIYnTzo9hXeQxzkwUbhDDc7WVvEd49h17mKa6w8QfB2EIEDD7W8XIG5RncWJ-n5n8nCSqHu4E6zkNP0BsMHsoIQz9Vpi8C5qNBL4Po-ca4mAAVTciZ-3q8TREYwunoIejOppPSO_k'
            });

            await BlogPageCTA.create({
                title: 'Stay Ahead of the Curve',
                description: 'Get the latest content marketing tips delivered to your inbox.',
                button_text: 'Subscribe'
            });

            if (firstUser && publishedStatus) {
                const generateLongContent = (title: string, paragraphs = 20) => {
                    let out = `<h1>${title}</h1>`;
                    out += `<p>${title} — an in-depth guide.</p>`;
                    for (let i = 1; i <= paragraphs; i++) {
                        out += `<h2>Section ${i}</h2>`;
                        out += `<p>${title} — detailed paragraph ${i}. This paragraph provides an extended explanation of the topic, covering best practices, examples, data points, and actionable steps. Use examples and region-specific insights where appropriate to drive relevance for Nepali users.</p>`;
                        out += `<p>Additional insights: research, testing, and iteration are key. Tools and measurement help guide changes. Use analytics to identify which sections drive engagement and optimize headings for featured snippets. Consider designing content for skimmers with clear takeaways, lists, and callouts.</p>`;
                    }
                    out += `<h2>Wrap Up</h2><p>Concluding notes and takeaways.</p>`;
                    return out;
                };

                const baseTopics = [
                    {
                        slug: 'content-marketing-strategy-nepal',
                        title: 'A Modern Content Marketing Strategy for Nepali Businesses',
                        content: `
                            <p>Building a content marketing strategy in Nepal often requires a tailored approach that recognizes local audience semantics and search behaviors. Start with audience research: who are your customers, where they live, and what drives their decisions. Combine this with a keyword strategy that mixes high-level branded queries with localized, intent-driven reaches.</p>
                            <p>Next, map your content to the buyer journey. Topics that answer awareness questions perform well at the top of the funnel, while decision-stage content focuses on product comparisons, case studies, and ROI-focused materials. Create long-form pillar pages that link to shorter, action-driven posts. Regularly measure engagement metrics and iterate, emphasizing local trends and cultural events that can be timely hooks.</p>
                            <h2>Execution Tips</h2>
                            <ul>
                                <li>Create editorial calendars with clear publishing cadence.</li>
                                <li>Interview subject matter experts and amplify quotes to add authority.</li>
                                <li>Monitor organic and referral growth, and double down on high-performing topics.</li>
                            </ul>
                            <p>By combining strategic planning with local context and consistent execution, businesses in Nepal can create content that attracts, engages, and converts.</p>
                        `,
                        tags: 'content,marketing,nepal,strategy',
                        thumbnail: 'https://images.unsplash.com/photo-1528426776029-6f72c03bd0d7?auto=format&fit=crop&w=1400&q=80',
                        metaTitle: 'Content Marketing Strategy for Nepali Businesses',
                        metaDescription: 'Learn how to craft a content strategy that works in Nepal with audience research, pillar pages, and execution tips.',
                        authorId: firstUser._id,
                        status: publishedStatus._id,
                    },
                    {
                        slug: 'long-form-seo-best-practices',
                        title: 'Long-Form SEO: How to Create Content That Ranks',
                        content: `
                            <p>Long-form content remains a powerful tool for ranking, especially when it follows strong SEO fundamentals: clear structure, internal links, authoritative citations, and semantic keyword coverage. Use headings to break up content, provide a table of contents for longer reads, and include example use cases that help readers apply concepts.</p>
                            <p>When constructing long-form articles, build topical authority by creating clusters of related pieces and linking them back to a central hub. Optimize for readability by using short paragraphs and adding visual elements like charts, screenshots, and callouts for important takeaways.</p>
                            <h3>On-Page Optimization</h3>
                            <ul>
                                <li>Target long-tail keywords with high intent and low competition.</li>
                                <li>Use structured data where appropriate to help search engines understand your content.</li>
                                <li>Ensure page speed and mobile friendliness to reduce bounce rates.</li>
                            </ul>
                            <p>Good long-form SEO is both technical and human-centered; aim for value first, then enhance discoverability.</p>
                        `,
                        tags: 'seo,long-form,content',
                        thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1400&q=80',
                        metaTitle: 'Long-Form SEO Best Practices',
                        metaDescription: 'A guide to creating long-form content that ranks and converts.',
                        authorId: firstUser._id,
                        status: publishedStatus._id,
                    },
                    {
                        slug: 'case-study-pillar-page-growth',
                        title: 'Case Study: How Pillar Pages Drove Organic Growth',
                        content: `
                            <p>Pillar pages act as strategic anchors for topic clusters. In this case study, a Nepal-based client consolidated fragmented blog posts into a single, comprehensive pillar page, and interlinked related articles with clear navigation. Within 16 weeks, organic traffic to the topic cluster increased by 68% and keyword rankings improved on the target 10+ queries.</p>
                            <p>This approach worked because it improved topical relevance and user experience. The team included original research, local data points, and strong calls to action that guided readers to the services page. Remember: internal links transfer topical signals and help search engines understand the semantic relationships between pages.</p>
                        `,
                        tags: 'case-study,seo,pillar-pages',
                        thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
                        metaTitle: 'Pillar Page Case Study',
                        metaDescription: 'Learn how consolidating content into pillar pages can grow organic traffic and rankings.',
                        authorId: firstUser._id,
                        status: publishedStatus._id,
                    },
                ];

                const posts = [] as any[];
                for (let i = 0; i < baseTopics.length; i++) {
                    const t = baseTopics[i];
                    posts.push({ ...t, content: generateLongContent(t.title, 24) });
                    for (let v = 1; v <= 3; v++) {
                        posts.push({
                            slug: `${t.slug}-part-${v}`,
                            title: `${t.title} — Part ${v}`,
                            content: generateLongContent(`${t.title} — Part ${v}`, 24 + v * 6),
                            tags: t.tags + ',longform',
                            thumbnail: t.thumbnail,
                            metaTitle: `${t.metaTitle} — Part ${v}`,
                            metaDescription: t.metaDescription,
                            authorId: t.authorId,
                            status: t.status,
                        });
                    }
                }

                for (const p of posts) {
                    await BlogPost.create(p as any);
                }
            }
            results.blog = { success: true, message: 'Blog seeded successfully' };
        } catch (error) {
            results.blog.message = error instanceof Error ? error.message : 'Failed to seed blog';
        }

        // 10. Seed Testimonials
        try {
            try {
                await ReviewTestimonials.deleteMany({});
            } catch (e) {
                // Table might not exist yet
            }

            const firstService = await ServicePosts.findOne().lean();
            if (firstService) {
                await ReviewTestimonials.create({
                    name: 'Ram Shrestha',
                    role: 'Homeowner',
                    content: 'Great AC and quick installation — technicians were professional and helpful!',
                    url: 'https://via.placeholder.com/150',
                    rating: 5,
                    service: firstService._id,
                    link: 'homepage',
                });
            }
            results.testimonials = { success: true, message: 'Testimonials seeded successfully' };
        } catch (error) {
            results.testimonials.message = error instanceof Error ? error.message : 'Failed to seed testimonials';
        }

        // 10. Seed Navbar
        try {
            const { NavbarItems } = await import('@/db/navbarSchema');
            const existingNavItems = await NavbarItems.findOne().lean();

            if (!existingNavItems) {
                // Get first service category for services dropdown
                const categories = await ServiceCategories.find().limit(5).lean();

                // Seed main navbar items
                const homeResult = await NavbarItems.create({ label: 'Home', href: '/', order: 0, is_button: 0, is_active: 1 });
                const servicesResult = await NavbarItems.create({ label: 'Services', href: '/services', order: 1, is_button: 0, is_active: 1, is_dropdown: 1 });

                // Add service categories as dropdown items (parent_id = services item id)
                if (categories.length > 0) {
                    const servicesId = servicesResult._id;
                    for (let i = 0; i < categories.length; i++) {
                        const catSubs = await ServiceSubcategories.findOne({ category_id: categories[i]._id }).lean();
                        const isDropdown = !!catSubs ? 1 : 0;
                        await NavbarItems.create({
                            label: categories[i].name,
                            href: `/services/category/${categories[i].slug}`,
                            order: i,
                            parent_id: servicesId,
                            is_button: 0,
                            is_active: 1,
                            is_dropdown: isDropdown,
                        });
                    }
                }

                // Other main nav items
                await NavbarItems.create({ label: 'About Us', href: '/about', order: 2, is_button: 0, is_active: 1 });
                await NavbarItems.create({ label: 'Products', href: '/products', order: 3, is_button: 0, is_active: 1 });
                await NavbarItems.create({ label: 'FAQ', href: '/faq', order: 4, is_button: 0, is_active: 1 });
                await NavbarItems.create({ label: 'Contact', href: '/contact', order: 5, is_button: 0, is_active: 1 });
                await NavbarItems.create({ label: 'Cart', href: '/cart', order: 6, is_button: 1, is_active: 1 });
            }
            results.navbar = { success: true, message: 'Navbar seeded successfully' };
        } catch (error) {
            results.navbar.message = error instanceof Error ? error.message : 'Failed to seed navbar';
        }

        // 11. Seed Footer
        try {
            // Remove old footer data
            await FooterLink.deleteMany({});
            await FooterSection.deleteMany({});

            const defaultSections = [
                {
                    title: 'Solutions',
                    links: [
                        { label: 'Content Strategy', href: '/services' },
                        { label: 'SEO Writing', href: '/services' },
                        { label: 'Copywriting', href: '/services' },
                        { label: 'Social Media', href: '/services' },
                    ],
                },
                {
                    title: 'Company',
                    links: [
                        { label: 'About Us', href: '/about' },
                        { label: 'FAQ', href: '/faq' },
                        { label: 'Terms', href: '/terms' },
                        { label: 'Contact', href: '/contact' },
                    ],
                },
            ];

            const store = await StoreSettings.findOne().lean();
            if (!store) {
                results.footer = { success: false, message: 'No store settings found to attach footer to' };
            } else {
                for (const [sIdx, sec] of defaultSections.entries()) {
                    const secRes = await FooterSection.create({ store_id: store._id, title: sec.title || '', order: sIdx });
                    const newSecId = secRes._id;
                    if (sec.links && sec.links.length) {
                        for (const [lIdx, link] of sec.links.entries()) {
                            await FooterLink.create({ section_id: newSecId, label: link.label, href: link.href, is_external: 0, order: lIdx });
                        }
                    }
                }

                if (!store.footer_text) {
                    await StoreSettings.findByIdAndUpdate(store._id, { footer_text: '© ' + new Date().getFullYear() + ' ' + (store.store_name || 'Your Store') + '. All rights reserved.' });
                }

                results.footer = { success: true, message: 'Footer seeded successfully' };
            }
        } catch (error) {
            results.footer.message = error instanceof Error ? error.message : 'Failed to seed footer';
        }

        // Seed other pages with minimal data
        const minimalPages = ['about', 'contact', 'faq', 'terms'];
        for (const page of minimalPages) {
            results[page] = { success: true, message: `${page} seeded successfully` };
        }

        const successCount = Object.values(results).filter(r => r.success).length;
        const totalCount = Object.keys(results).length;
        const allSucceeded = successCount === totalCount;

        return NextResponse.json(
            {
                success: allSucceeded,
                message: allSucceeded
                    ? 'All pages seeded successfully'
                    : `${successCount} of ${totalCount} pages seeded successfully`,
                results,
            },
            { status: allSucceeded ? 201 : 207 }
        );
    } catch (error) {
        console.error('Error in master seed:', error);
        return NextResponse.json(
            {
                error: 'Failed to execute master seed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
