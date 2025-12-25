const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function TrustSection() {
    try {
        const res = await fetch(`${API_BASE}/api/pages/services/trust`, { next: { tags: ['services-trust'] } });
        const data = res.ok ? await res.json() : null;
        const title = data?.title || 'Why Nepal trusts our service';
        const description = data?.description || '';
        const quoteText = data?.quote_text || 'The team was incredibly professional. They installed our office AC system in one day and left the place spotless. Highly recommended!';
        const quoteAuthor = data?.quote_author || 'Rajesh Hamal';
        const quoteRole = data?.quote_role || 'Business Owner, Thamel';
        const quoteImage = data?.quote_image || '';

        return (
            <section className="bg-slate-50 py-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">{title}</h2>
                            {description ? <p className="text-slate-600 mb-6">{description}</p> : null}
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
                            <p className="text-lg text-slate-600 italic mb-6 relative z-10">{quoteText}</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${quoteImage}')` }} />
                                <div>
                                    <h5 className="font-bold text-slate-900 text-sm">{quoteAuthor}</h5>
                                    <p className="text-xs text-slate-500">{quoteRole}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        return (
            <section className="bg-slate-50 py-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-slate-500">Failed to load trust section</div>
                </div>
            </section>
        );
    }
}
