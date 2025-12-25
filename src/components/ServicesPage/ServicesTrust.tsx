interface TrustStat { id?: number; label: string; value: string; description?: string; }
interface Testimonial { id?: number; content: string; name?: string; role?: string; url?: string }

const ServicesTrust = ({ section, stats = [], testimonial = null }: { section?: { heading?: string }, stats?: TrustStat[], testimonial?: Testimonial | null }) => {
    if (!section && (!stats || stats.length === 0) && !testimonial) return null;

    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-6">{section?.heading || 'Why Nepal trusts our service'}</h2>
                        <div className="flex flex-col gap-6">
                            {stats && stats.length > 0 ? stats.map(s => (
                                <div key={s.id} className="flex gap-4 items-start">
                                    <span className="text-4xl text-primary font-black">{s.value}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{s.label}</h4>
                                        {s.description ? <p className="text-sm text-slate-500">{s.description}</p> : null}
                                    </div>
                                </div>
                            )) : (
                                // fallback
                                <>
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
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
                        {testimonial ? (
                            <>
                                <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-4">format_quote</span>
                                <p className="text-lg text-slate-600 italic mb-6 relative z-10">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    {testimonial.url ? (<div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${testimonial.url}')` }} />) : null}
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm">{testimonial.name || 'Customer'}</h5>
                                        <p className="text-xs text-slate-500">{testimonial.role || ''}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-4">format_quote</span>
                                <p className="text-lg text-slate-600 italic mb-6 relative z-10">"The team was incredibly professional. They installed our office AC system in one day and left the place spotless. Highly recommended!"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuABFDq2boqSreVjEIXWTgDLRMQ_RYSX41ayzLdnNYJMJbFtH4HzmhK3i3w8-QX85BECmTiey8ai1BxoROX4KD4Mn59_fOLLNJkVpQRE95w9N62vGtPM5JRVmmqG4cTP1OkiZaTQ-n77i5lJNDYyk869p308_2wrBUPfm3j9gJqYo-f89NoLkMTlb2GPv2Qvj-OGfU6OEhFuZebu3LWWpRx5tPOMC3cVtUQJedhHp5pU-0KGNf882TAwuj79STj2BHSRH7yAkvqQXoA')` }} />
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm">Rajesh Hamal</h5>
                                        <p className="text-xs text-slate-500">Business Owner, Thamel</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesTrust;