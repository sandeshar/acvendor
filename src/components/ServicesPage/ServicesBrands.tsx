const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function ServicesBrands() {
    try {
        const res = await fetch(`${API_BASE}/api/pages/services/brands`, { next: { tags: ['services-brands'] } });
        const brands = res.ok ? await res.json() : [];
        return (
            <div className="border-t border-gray-200 pt-16">
                <p className="text-center text-slate-500 font-medium mb-8">Trusted by leading brands and businesses</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.length === 0 ? (
                        <span className="text-2xl font-black text-slate-400">No brands configured</span>
                    ) : (
                        brands.map((b: any) => (
                            <div key={b.id} className="flex items-center gap-4">
                                {b.logo ? (
                                    <img src={b.logo} alt={b.name} className="h-16 object-contain" />
                                ) : (
                                    <span className="text-2xl font-black text-slate-400">{b.name}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="border-t border-gray-200 pt-16">
                <p className="text-center text-slate-500 font-medium mb-8">Trusted by leading brands and businesses</p>
                <div className="text-center text-slate-400">Failed to load brands</div>
            </div>
        );
    }
}