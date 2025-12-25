import HeroSection from "@/components/ServicesPage/HeroSection";
import ServicesFeatureStrip from "@/components/ServicesPage/ServicesFeatureStrip";
import ServicesOverview from "@/components/ServicesPage/ServicesOverview";
import ServiceDetails from "@/components/ServicesPage/ServiceDetails";
import ProcessSection from "@/components/ServicesPage/ProcessSection";
import ServicesBrands from "@/components/ServicesPage/ServicesBrands";
import TrustSection from "@/components/ServicesPage/TrustSection";
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import CTASection from "@/components/ServicesPage/CTASection";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Use an absolute base URL for server-side fetches. In server environments
// relative URLs like `/api/...` can cause "Failed to parse URL" errors.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getServicesPageData() {
    try {
        const [
            heroRes,
            detailsRes,
            processSectionRes,
            processStepsRes,
            ctaRes,
            brandsRes,
            trustRes,
            featuresRes,
        ] = await Promise.all([
            fetch(`${API_BASE}/api/pages/services/hero`, { next: { tags: ['services-hero'] } }),
            fetch(`${API_BASE}/api/pages/services/details`, { next: { tags: ['services-details'] } }),
            fetch(`${API_BASE}/api/pages/services/process-section`, { next: { tags: ['services-process-section'] } }),
            fetch(`${API_BASE}/api/pages/services/process-steps`, { next: { tags: ['services-process-steps'] } }),
            fetch(`${API_BASE}/api/pages/services/cta`, { next: { tags: ['services-cta'] } }),
            fetch(`${API_BASE}/api/pages/services/brands`, { next: { tags: ['services-brands'] } }),
            fetch(`${API_BASE}/api/pages/services/trust`, { next: { tags: ['services-trust'] } }),
            fetch(`${API_BASE}/api/pages/services/features`, { next: { tags: ['services-features'] } }),
        ]);

        const hero = heroRes.ok ? await heroRes.json() : null;
        const details = detailsRes.ok ? await detailsRes.json() : [];
        const processSection = processSectionRes.ok ? await processSectionRes.json() : null;
        const processSteps = processStepsRes.ok ? await processStepsRes.json() : [];
        const cta = ctaRes.ok ? await ctaRes.json() : null;
        const brands = brandsRes.ok ? await brandsRes.json() : [];
        const trust = trustRes.ok ? await trustRes.json() : null;
        const features = featuresRes.ok ? await featuresRes.json() : [];

        return {
            hero,
            details,
            processSection,
            processSteps,
            cta,
            brands,
            trust,
            features,
        };
    } catch (error) {
        console.error('Error fetching services page data:', (error as Error)?.message || String(error));
        return {
            hero: null,
            details: [],
            processSection: null,
            processSteps: [],
            cta: null,
            brands: [],
            trust: null,
            features: [],
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

            {/* Reordered to match Admin UI: Process -> CTA -> Brands -> Trust -> Features -> Services Overview/Details */}

            <ProcessSection section={data.processSection} steps={data.processSteps} />

            <CTASection data={data.cta} />

            <ServicesBrands brands={data.brands} />

            <TrustSection data={data.trust} />

            <ServicesFeatureStrip features={data.features} />

            <ServicesOverview services={services} />
            <ServiceDetails services={services} />
        </main>
    );
}
