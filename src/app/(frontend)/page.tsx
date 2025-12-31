import Contact from "@/components/Homepage/Contact";
import Expertise from "@/components/Homepage/Expertise";
import Hero from "@/components/Homepage/Hero";
import Trust from "@/components/Homepage/Trust";
import ProductShowcase from '@/components/Homepage/ProductShowcase';
import TestimonialSlider from "@/components/shared/TestimonialSlider";


async function getHomepageData() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
        const [heroRes, trustSectionRes, trustLogosRes, expertiseSectionRes, expertiseItemsRes, contactSectionRes, featuredRes] = await Promise.all([
            fetch(`${baseUrl}/api/pages/homepage/hero`, { next: { tags: ['homepage-hero'] } }),
            fetch(`${baseUrl}/api/pages/homepage/trust-section`, { next: { tags: ['homepage-trust-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/trust-logos`, { next: { tags: ['homepage-trust-logos'] } }),
            fetch(`${baseUrl}/api/pages/homepage/expertise-section`, { next: { tags: ['homepage-expertise-section'] } }),
            fetch(`${baseUrl}/api/pages/homepage/expertise-items`, { next: { tags: ['homepage-expertise-items'] } }),
            fetch(`${baseUrl}/api/pages/homepage/contact-section`, { next: { tags: ['homepage-contact-section'] } }),
            // Request featured products for the Midea brand
            fetch(`${baseUrl}/api/products?featured=1&limit=4&brand=midea`, { next: { tags: ['products'] } }),
        ]);

        const hero = heroRes.ok ? await heroRes.json() : {};
        const trustSection = trustSectionRes.ok ? await trustSectionRes.json() : {};
        const trustLogos = trustLogosRes.ok ? await trustLogosRes.json() : [];
        const expertiseSection = expertiseSectionRes.ok ? await expertiseSectionRes.json() : {};
        const expertiseItems = expertiseItemsRes.ok ? await expertiseItemsRes.json() : [];
        const contactSection = contactSectionRes.ok ? await contactSectionRes.json() : {};
        const featuredProducts = featuredRes.ok ? await featuredRes.json() : [];

        return {
            hero: Object.keys(hero).length ? hero : null,
            trustSection: Object.keys(trustSection).length ? trustSection : null,
            trustLogos,
            expertiseSection: Object.keys(expertiseSection).length ? expertiseSection : null,
            expertiseItems,
            contactSection: Object.keys(contactSection).length ? contactSection : null,
            products: featuredProducts,
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
        };
    }
}

export default async function Home() {
    const data = await getHomepageData();

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full">
                <Hero data={data.hero} />
                <Trust section={data.trustSection} logos={data.trustLogos} />
                {/* Product showcase (featured products) */}
                <ProductShowcase products={data.products || []} brand="midea" />
                <Expertise section={data.expertiseSection} items={data.expertiseItems} />
                <TestimonialSlider filter="homepage" />
                <Contact data={data.contactSection} />
            </div>
        </main>
    );
}
