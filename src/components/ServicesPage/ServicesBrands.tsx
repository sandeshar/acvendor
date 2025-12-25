const ServicesBrands = ({ brands = [] }: { brands?: Array<{ name: string; logo?: string; link?: string }> }) => {
    const items = brands.length > 0 ? brands : [{ name: 'SAMSUNG' }, { name: 'DAIKIN' }, { name: 'LG' }, { name: 'MITSUBISHI' }, { name: 'GREE' }];
    return (
        <div className="border-t border-gray-200 pt-16">
            <p className="text-center text-slate-500 font-medium mb-8">Trusted by leading brands and businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {items.map((b, i) => (
                    <a key={(b.name || '') + i} href={b.link || '#'} className="flex items-center gap-3 p-2 hover:opacity-80">
                        {b.logo ? (
                            <img src={b.logo} alt={b.name} className="h-8" />
                        ) : (
                            <span className="text-2xl font-black text-slate-400">{b.name}</span>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ServicesBrands;