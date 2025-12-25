const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function ServicesFeatureStrip() {
    try {
        const res = await fetch(`${API_BASE}/api/pages/services/features`, { next: { tags: ['services-features'] } });
        const features = res.ok ? await res.json() : [];
        const items = features.length > 0 ? features : [
            { icon: 'verified_user', title: 'Certified Experts', description: 'Trained technicians for all major brands.' },
            { icon: 'avg_pace', title: 'Fast Response', description: 'Same-day service available in Kathmandu.' },
            { icon: 'handyman', title: 'Genuine Parts', description: '100% original spare parts warranty.' },
        ];
        return (
            <div className="bg-white border-b border-gray-100 py-8 relative -mt-8 mx-4 md:mx-auto max-w-[1100px] rounded-xl shadow-lg z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {items.map((it: any) => (
                        <div key={it.id || it.title} className="flex items-center gap-4 py-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-3xl">{it.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{it.title}</h3>
                                <p className="text-sm text-slate-500">{it.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="bg-white border-b border-gray-100 py-8 relative -mt-8 mx-4 md:mx-auto max-w-[1100px] rounded-xl shadow-lg z-10">
                <div className="text-center text-slate-500">Failed to load features</div>
            </div>
        );
    }
}