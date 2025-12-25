import HeroSection from "@/components/ServicesPage/HeroSection";
import ServicesFeatureStrip from "@/components/ServicesPage/ServicesFeatureStrip";
import ServicesOverview from "@/components/ServicesPage/ServicesOverview";
import ServiceDetails from "@/components/ServicesPage/ServiceDetails";
import ProcessSection from "@/components/ServicesPage/ProcessSection";
import ServicesBrands from "@/components/ServicesPage/ServicesBrands";
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import CTASection from "@/components/ServicesPage/CTASection";
import ServicesTrust from "@/components/ServicesPage/ServicesTrust";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Use an absolute base URL for server-side fetches. In server environments
// relative URLs like `/api/...` can cause "Failed to parse URL" errors.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getServicesPageData() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
        const [
            heroRes,
            detailsRes,
            processSectionRes,
            processStepsRes,
            ctaRes,
            featureRes,
            overviewRes,
            brandsRes,
            trustStatsRes,
            trustSectionRes,
        ] = await Promise.all([
            fetch(`${API_BASE}/api/pages/services/hero`, { next: { tags: ['services-hero'] } }),
            fetch(`${API_BASE}/api/pages/services/details`, { next: { tags: ['services-details'] } }),
            fetch(`${API_BASE}/api/pages/services/process-section`, { next: { tags: ['services-process-section'] } }),
            fetch(`${API_BASE}/api/pages/services/process-steps`, { next: { tags: ['services-process-steps'] } }),
            fetch(`${API_BASE}/api/pages/services/cta`, { next: { tags: ['services-cta'] } }),
            fetch(`${API_BASE}/api/pages/services/feature-strip`, { next: { tags: ['services-feature-strip'] } }),
            fetch(`${API_BASE}/api/pages/services/overview`, { next: { tags: ['services-overview'] } }),
            fetch(`${API_BASE}/api/pages/services/brands`, { next: { tags: ['services-brands'] } }),
            fetch(`${API_BASE}/api/pages/services/trust-stats`, { next: { tags: ['services-trust-stats'] } }),
            fetch(`${API_BASE}/api/pages/services/trust-section`, { next: { tags: ['services-trust-section'] } }),
        ]);

        const hero = heroRes.ok ? await heroRes.json() : null;
        const details = detailsRes.ok ? await detailsRes.json() : [];
        const processSection = processSectionRes.ok ? await processSectionRes.json() : null;
        const processSteps = processStepsRes.ok ? await processStepsRes.json() : [];
        const cta = ctaRes.ok ? await ctaRes.json() : null;

        const featureStrip = featureRes.ok ? await featureRes.json() : [];
        const overview = overviewRes.ok ? await overviewRes.json() : null;
        const brands = brandsRes.ok ? await brandsRes.json() : [];
        const trustStats = trustStatsRes.ok ? await trustStatsRes.json() : [];
        const trustSection = trustSectionRes.ok ? await trustSectionRes.json() : null;

        // If trust section points to a testimonial, fetch it
        let testimonial = null;
        try {
            const testimonialId = trustSection?.testimonial_id;
            if (testimonialId) {
                const r = await fetch(`${API_BASE}/api/testimonial?id=${testimonialId}`);
                if (r.ok) testimonial = await r.json();
            }
        } catch (e) {
            // ignore testimonial fetch errors
            console.warn('Failed to fetch linked testimonial:', e);
        }

        return {
            hero,
            details,
            processSection,
            processSteps,
            cta,
            featureStrip,
            overview,
            brands,
            trustStats,
            trustSection,
            testimonial,
        };
    } catch (error) {
        console.error('Error fetching services page data:', (error as Error)?.message || String(error));
        return {
            hero: null,
            details: [],
            processSection: null,
            processSteps: [],
            cta: null,
            featureStrip: [],
            overview: null,
            brands: [],
            trustStats: [],
            trustSection: null,
            testimonial: null,
        };
    }
} 

function mergeServiceDetailsWithPosts(details: any[], posts: any[]) {
    const normalizedDetails = (details || []).map((detail) => ({
        ...detail,
        // Ensure bullets stays a JSON string for the ServiceDetails component
        bullets: typeof detail.bullets === 'string'
            ? detail.bullets
            : JSON.stringify(detail.bullets || []),
    }));

    const existingSlugs = new Set(
        normalizedDetails.map((d) => (d.slug || d.key || '').toLowerCase())
    );

    const fallbackFromPosts = (posts || [])
        // Avoid duplicating services that already have page details
        .filter((p) => !existingSlugs.has((p.slug || '').toLowerCase()))
        .map((p, idx) => ({
            // Map to the shape ServiceDetails expects
            id: p.id,
            key: p.slug,
            slug: p.slug,
            icon: p.icon || 'design_services',
            title: p.title,
            description: p.excerpt,
            bullets: '[]',
            image: p.thumbnail || '',
            image_alt: p.title,
            // Append after any existing detailed services
            display_order: normalizedDetails.length + idx + 1,
            is_active: 1,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));

    return [...normalizedDetails, ...fallbackFromPosts];
}

async function getServicePosts() {
    try {
        const url = `${API_BASE}/api/services`;
        const res = await fetch(url, { next: { tags: ['services'] } });
        if (!res.ok) {
            console.error('Error fetching service posts: non-OK response from ' + url + ' status=' + res.status);
            return [];
        }
        return res.ok ? await res.json() : [];
    } catch (error) {
        // Avoid passing the whole Error object to console to prevent the runtime
        // from attempting to parse source maps for stack frames.
        console.error('Error fetching service posts:', (error as Error)?.message || String(error));
        return [];
    }
}

export default async function ServicesPage() {
    const [data, posts] = await Promise.all([
        getServicesPageData(),
        getServicePosts()
    ]);

    const services = mergeServiceDetailsWithPosts(data.details, posts);

    return (
        <main className="page-bg grow ">
            <HeroSection data={data.hero} />
            <ServicesFeatureStrip />
            <ServicesOverview services={services} />
            <ServiceDetails services={services} />
            <ProcessSection section={data.processSection} steps={data.processSteps} />

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ServicesBrands />
            </div>

            <ServicesTrust section={data.trustSection} stats={data.trustStats} testimonial={data.testimonial} />

            <CTASection data={data.cta} />
        </main>
    );
}
