interface ServiceCardProps {
    title: string;
    description: string;
    icon?: string;
    href?: string;
}

const ServiceCard = ({ title, description, icon = 'build', href = '#' }: ServiceCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
        <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
        <a className="text-primary font-bold text-sm flex items-center gap-1 hover:underline" href={href}>Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
    </div>
);

interface ServicesOverviewProps {
    services?: any[];
}

const ServicesOverview = ({ services = [] }: ServicesOverviewProps) => {
    const items = services.slice(0, 8);
    return (
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Our Core Services</h2>
                <p className="text-lg text-slate-600">Comprehensive HVAC solutions tailored for homes, offices, and industrial complexes. We ensure your environment is comfortable year-round.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                {items.map((s) => (
                    <ServiceCard key={s.slug || s.key || s.id} title={s.title} description={s.description || s.excerpt || ''} icon={s.icon || 'build'} href={`/services/${s.slug || s.key || ''}`} />
                ))}
            </div>
        </main>
    );
};

export default ServicesOverview;