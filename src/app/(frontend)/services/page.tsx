import HeroSection from "@/components/ServicesPage/HeroSection";
import ServicesFeatureStrip from "@/components/ServicesPage/ServicesFeatureStrip";
import ServicesOverview from "@/components/ServicesPage/ServicesOverview";
import ServiceDetails from "@/components/ServicesPage/ServiceDetails";
import ProcessSection from "@/components/ServicesPage/ProcessSection";
import ServicesBrands from "@/components/ServicesPage/ServicesBrands";
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import CTASection from "@/components/ServicesPage/CTASection";

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
            <ServicesFeatureStrip />
            <ServicesOverview services={services} />
            <ServiceDetails services={services} />
            <ProcessSection section={data.processSection} steps={data.processSteps} />

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ServicesBrands />
            </div>

            <section className="bg-slate-50 py-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">Why Nepal trusts our service</h2>
                            <div className="flex flex-col gap-6">
                                <div className="flex gap-4 items-start">
                                    <span className="text-4xl text-primary font-black">5k+</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Happy Customers</h4>
                                        <p className="text-sm text-slate-500">Across Kathmandu, Lalitpur, and Bhaktapur.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="text-4xl text-primary font-black">10+</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Years Experience</h4>
                                        <p className="text-sm text-slate-500">Serving the industry with dedication.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="text-4xl text-primary font-black">24/7</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Emergency Support</h4>
                                        <p className="text-sm text-slate-500">Always available for urgent repairs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
                            <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-4">format_quote</span>
                            <p className="text-lg text-slate-600 italic mb-6 relative z-10">"The team was incredibly professional. They installed our office AC system in one day and left the place spotless. Highly recommended!"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuABFDq2boqSreVjEIXWTgDLRMQ_RYSX41ayzLdnNYJMJbFtH4HzmhK3i3w8-QX85BECmTiey8ai1BxoROX4KD4Mn59_fOLLNJkVpQRE95w9N62vGtPM5JRVmmqG4cTP1OkiZaTQ-n77i5lJNDYyk869p308_2wrBUPfm3j9gJqYo-f89NoLkMTlb2GPv2Qvj-OGfU6OEhFuZebu3LWWpRx5tPOMC3cVtUQJedhHp5pU-0KGNf882TAwuj79STj2BHSRH7yAkvqQXoA')` }} />
                                <div>
                                    <h5 className="font-bold text-slate-900 text-sm">Rajesh Hamal</h5>
                                    <p className="text-xs text-slate-500">Business Owner, Thamel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection data={data.cta} />
        </main>
    );
}
