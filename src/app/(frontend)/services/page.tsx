import HeroSection from "@/components/ServicesPage/HeroSection";
import ServiceDetails from "@/components/ServicesPage/ServiceDetails";
import ProcessSection from "@/components/ServicesPage/ProcessSection";
import CTASection from "@/components/ServicesPage/CTASection";
import TestimonialSlider from "@/components/shared/TestimonialSlider";

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
            ctaRes
        ] = await Promise.all([
            fetch(`${API_BASE}/api/pages/services/hero`, { next: { tags: ['services-hero'] } }),
            fetch(`${API_BASE}/api/pages/services/details`, { next: { tags: ['services-details'] } }),
            fetch(`${API_BASE}/api/pages/services/process-section`, { next: { tags: ['services-process-section'] } }),
            fetch(`${API_BASE}/api/pages/services/process-steps`, { next: { tags: ['services-process-steps'] } }),
            fetch(`${API_BASE}/api/pages/services/cta`, { next: { tags: ['services-cta'] } }),
        ]);

        const hero = heroRes.ok ? await heroRes.json() : null;
        const details = detailsRes.ok ? await detailsRes.json() : [];
        const processSection = processSectionRes.ok ? await processSectionRes.json() : null;
        const processSteps = processStepsRes.ok ? await processStepsRes.json() : [];
        const cta = ctaRes.ok ? await ctaRes.json() : null;

        return {
            hero,
            details,
            processSection,
            processSteps,
            cta,
        };
    } catch (error) {
        // Log only the error message to avoid printing full Error objects which can
        // trigger source-map parsing in the server dev bundle and produce confusing
        // "Invalid source map" messages.
        console.error('Error fetching services page data:', (error as Error)?.message || String(error));
        return {
            hero: null,
            details: [],
            processSection: null,
            processSteps: [],
            cta: null,
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
            <ServiceDetails services={services} />
            <ProcessSection section={data.processSection} steps={data.processSteps} />
            <TestimonialSlider
                filter="services"
                title="Client Success Stories"
                subtitle="Discover how we've helped businesses achieve their goals"
            />
            <CTASection data={data.cta} />
        </main>
    );
}
