const ServicesBrands = () => {
    const brands = ['SAMSUNG', 'DAIKIN', 'LG', 'MITSUBISHI', 'GREE'];
    return (
        <div className="border-t border-gray-200 pt-16">
            <p className="text-center text-slate-500 font-medium mb-8">Trusted by leading brands and businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                {brands.map((b) => <span key={b} className="text-2xl font-black text-slate-400">{b}</span>)}
            </div>
        </div>
    );
};

export default ServicesBrands;