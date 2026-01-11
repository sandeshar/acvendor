import { stripHtml } from '@/utils/stripHtml';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function TrustSection() {
    try {
        const res = await fetch(`${API_BASE}/api/pages/services/trust`, { next: { tags: ['services-trust'] } });
        const data = res.ok ? await res.json() : null;
        const title = data?.title || '';
        const description = data?.description || '';
        const quoteText = data?.quote_text || '';
        const quoteAuthor = data?.quote_author || '';
        const quoteRole = data?.quote_role || '';
        const quoteImage = data?.quote_image || '';

        const stats = [
            { value: data?.stat1_value, label: data?.stat1_label, sublabel: data?.stat1_sublabel },
            { value: data?.stat2_value, label: data?.stat2_label, sublabel: data?.stat2_sublabel },
            { value: data?.stat3_value, label: data?.stat3_label, sublabel: data?.stat3_sublabel },
        ].filter(s => s.value || s.label);

        return (
            <section className="bg-slate-50 py-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-6">{title}</h2>
                            {description ? <p className="text-slate-600 mb-6">{stripHtml(description)}</p> : null}
                            <div className="flex flex-col gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <span className="text-4xl text-primary font-black">{stat.value}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{stat.label}</h4>
                                            <p className="text-sm text-slate-500">{stripHtml(stat.sublabel)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {(quoteText || quoteAuthor) && (
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
                                <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-4">format_quote</span>
                                <p className="text-lg text-slate-600 italic mb-6 relative z-10">{stripHtml(quoteText)}</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${quoteImage}')` }} />
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-sm">{quoteAuthor}</h5>
                                        <p className="text-xs text-slate-500">{stripHtml(quoteRole)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
