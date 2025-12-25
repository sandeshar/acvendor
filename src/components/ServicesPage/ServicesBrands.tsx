const ServicesBrands = ({ brands = [] }: { brands?: { id?: number; name: string; logo_url?: string }[] }) => {
    const hasBrands = brands && brands.length > 0;
    return (
        <div className="border-t border-gray-200 pt-16">
            <p className="text-center text-slate-500 font-medium mb-8">Trusted by leading brands and businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {hasBrands ? brands.map((b) => (
                    b.logo_url ? <img key={b.id || b.name} src={b.logo_url} alt={b.name} className="h-8 object-contain" /> : <span key={b.id || b.name} className="text-2xl font-black text-slate-400">{b.name}</span>
                )) : (
                    // fallback list
                    ['SAMSUNG', 'DAIKIN', 'LG', 'MITSUBISHI', 'GREE'].map((b) => <span key={b} className="text-2xl font-black text-slate-400">{b}</span>)
                )}
            </div>
        </div>
    );
};

export default ServicesBrands;