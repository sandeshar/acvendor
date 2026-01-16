import Contact from "@/components/Homepage/Contact";
import Expertise from "@/components/Homepage/Expertise";
import Hero from "@/components/Homepage/Hero";
import HeroFeatures from "@/components/Homepage/HeroFeatures";
import Trust from "@/components/Homepage/Trust";
import AboutSection from "@/components/Homepage/AboutSection";
import ProductShowcase from '@/components/Homepage/ProductShowcase';
import ProjectGallery from "@/components/Homepage/ProjectGallery";
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import BlogSection from "@/components/Homepage/BlogSection";
import AboutDetails from "@/components/Homepage/AboutDetails";


async function getHomepageData() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
        // Fetch sections first to see if we have explicit product selections
        const productsSectionRes = await fetch(`${baseUrl}/api/pages/homepage/products-section`, { next: { tags: ['homepage-products-section'] } });
        const productsSection = productsSectionRes.ok ? (await productsSectionRes.json() || {}) : {};

        let productsUrl = `${baseUrl}/api/products?featured=1&limit=24`;
        if (productsSection.product_ids && Array.isArray(productsSection.product_ids) && productsSection.product_ids.length > 0) {
            productsUrl = `${baseUrl}/api/products?ids=${productsSection.product_ids.join(',')}`;
        }

        const [heroRes, trustSectionRes, trustLogosRes, expertiseSectionRes, expertiseItemsRes, contactSectionRes, featuredRes, testimonialsSectionRes, projectsRes, projectsSectionRes, heroFeaturesRes, aboutSectionRes, aboutItemsRes, blogSectionRes, blogPostsRes] = await Promise.all([
            fetch(`${baseUrl}/api/pages/homepage/hero`, { next: { tags: ['homepage-hero'] } }),
            fetch(`${baseUrl}/api/pages/homepage/trust-section`, { next: { tags: ['homepage-trust-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/trust-logos`, { next: { tags: ['homepage-trust-logos'] } }),
            fetch(`${baseUrl}/api/pages/homepage/expertise-section`, { next: { tags: ['homepage-expertise-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/expertise-items`, { next: { tags: ['homepage-expertise-items'] } }),
            fetch(`${baseUrl}/api/pages/homepage/contact-section`, { next: { tags: ['homepage-contact-section'] } }),
            fetch(productsUrl, { next: { tags: ['products'] } }),
            fetch(`${baseUrl}/api/pages/homepage/testimonials-section`, { next: { tags: ['homepage-testimonials-section'] } }),
            fetch(`${baseUrl}/api/projects?limit=3`, { next: { tags: ['projects'] } }),
            fetch(`${baseUrl}/api/pages/projects/section`, { next: { tags: ['projects-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/hero-floats`, { next: { tags: ['homepage-hero-floats'] } }),
            fetch(`${baseUrl}/api/pages/homepage/about-section`, { next: { tags: ['homepage-about-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/about-items`, { next: { tags: ['homepage-about-items'] } }),
            fetch(`${baseUrl}/api/pages/homepage/blog-section`, { next: { tags: ['homepage-blog-section'] } }),
            fetch(`${baseUrl}/api/blog?limit=3`, { next: { tags: ['homepage-blog-posts'] } }),
        ]);

        const hero = heroRes.ok ? (await heroRes.json() || {}) : {};
        const trustSection = trustSectionRes.ok ? (await trustSectionRes.json() || {}) : {};
        const trustLogos = trustLogosRes.ok ? (await trustLogosRes.json() || []) : [];
        const expertiseSection = expertiseSectionRes.ok ? (await expertiseSectionRes.json() || {}) : {};
        const expertiseItems = expertiseItemsRes.ok ? (await expertiseItemsRes.json() || []) : [];
        const contactSection = contactSectionRes.ok ? (await contactSectionRes.json() || {}) : {};
        let featuredProducts = featuredRes.ok ? (await featuredRes.json()) : [];

        // If returned as object with products array (from API response structure), extract it
        if (featuredProducts && !Array.isArray(featuredProducts) && featuredProducts.products) {
            featuredProducts = featuredProducts.products;
        }

        // If we have explicit IDs, we MUST preserve the order since MongoDB $in does not guarantee it
        if (productsSection.product_ids && Array.isArray(productsSection.product_ids) && productsSection.product_ids.length > 0) {
            const idMap = new Map(featuredProducts.map((p: any) => [String(p._id || p.id), p]));
            featuredProducts = productsSection.product_ids
                .map((id: string) => idMap.get(String(id)))
                .filter(Boolean);
        }

        const testimonialsSection = testimonialsSectionRes.ok ? (await testimonialsSectionRes.json() || {}) : {};
        const projects = projectsRes.ok ? (await projectsRes.json() || []) : [];
        const projectsSection = projectsSectionRes.ok ? (await projectsSectionRes.json() || {}) : {};
        const heroFeatures = heroFeaturesRes.ok ? (await heroFeaturesRes.json() || []) : [];
        const aboutSection = aboutSectionRes.ok ? (await aboutSectionRes.json() || {}) : {};
        const aboutItems = aboutItemsRes.ok ? (await aboutItemsRes.json() || []) : [];
        const blogSection = blogSectionRes.ok ? (await blogSectionRes.json() || {}) : {};
        const blogPosts = blogPostsRes.ok ? (await blogPostsRes.json() || []) : [];

        return {
            hero: Object.keys(hero).length ? hero : null,
            trustSection: Object.keys(trustSection).length ? trustSection : null,
            trustLogos,
            expertiseSection: Object.keys(expertiseSection).length ? expertiseSection : null,
            expertiseItems,
            contactSection: Object.keys(contactSection).length ? contactSection : null,
            products: featuredProducts,
            productsSection: Object.keys(productsSection).length ? productsSection : null,
            testimonialsSection: Object.keys(testimonialsSection).length ? testimonialsSection : null,
            projects,
            projectsSection: Object.keys(projectsSection).length ? projectsSection : null,
            heroFeatures,
            aboutSection: Object.keys(aboutSection).length ? aboutSection : null,
            aboutItems,
            blogSection: Object.keys(blogSection).length ? blogSection : null,
            blogPosts,
        };
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        return {
            hero: null,
            trustSection: null,
            trustLogos: [],
            expertiseSection: null,
            expertiseItems: [],
            contactSection: null,
            products: [],
            projects: [],
            projectsSection: null,
            heroFeatures: [],
            aboutSection: null,
            aboutItems: [],
            blogSection: null,
            blogPosts: [],
        };
    }
}

export default async function Home() {
    const data = await getHomepageData();

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full">
                <Hero data={data.hero} />
                <div className="bg-white w-full flex justify-center -mt-8 relative z-20">
                    <HeroFeatures features={data.heroFeatures} />
                </div>
                <Trust section={data.trustSection} logos={data.trustLogos} />

                {/* Show About section and details only if aboutSection exists and is active */}
                {data.aboutSection && ![0, '0', false].includes((data.aboutSection as any).is_active) && (
                    <>
                        <AboutSection section={data.aboutSection} />
                        <AboutDetails items={data.aboutItems || []} />
                    </>
                )}
                {/* Product showcase (featured products) */}
                <Contact data={data.contactSection} />

                <Expertise section={data.expertiseSection} items={data.expertiseItems} />

                {/* Product showcase (featured products) grouped by category */}
                {(() => {
                    const products = data.products || [];
                    if (products.length === 0) return null;

                    // Group by category name
                    const grouped: Record<string, any[]> = products.reduce((acc: any, p: any) => {
                        const catName = p.category?.name || 'Other Products';
                        if (!acc[catName]) acc[catName] = [];
                        acc[catName].push(p);
                        return acc;
                    }, {});

                    return Object.entries(grouped).map(([categoryName, items]) => (
                        <ProductShowcase
                            key={categoryName}
                            products={items}
                            brand={items[0]?.category?.slug}
                            section={{
                                ...data.productsSection,
                                title: categoryName,
                                description: `Explore our featured ${categoryName.toLowerCase()} selection.`
                            }}
                        />
                    ));
                })()}

                <ProjectGallery projects={data.projects || []} section={data.projectsSection} />
                {(!data.testimonialsSection || (data.testimonialsSection?.is_active ?? 1) === 1) && (
                    <TestimonialSlider filter="homepage" title={data.testimonialsSection?.title} subtitle={data.testimonialsSection?.subtitle} />
                )}
                <BlogSection posts={data.blogPosts || []} section={data.blogSection} />

            </div>
        </main>
    );
}
