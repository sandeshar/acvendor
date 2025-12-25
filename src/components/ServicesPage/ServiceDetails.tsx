interface ServiceDetailData {
    id: number;
    key: string;
    slug?: string;
    icon: string;
    title: string;
    description: string;
    bullets: string; // JSON string
    image: string;
    image_alt: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ServiceDetailsProps {
    services?: ServiceDetailData[];
}

const ServiceDetails = ({ services = [] }: ServiceDetailsProps) => {
    if (services.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-10 py-20 sm:py-32 bg-white">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-16 lg:gap-24">
                    {services.map((s, idx) => {
                        const isReversed = idx % 2 === 1;
                        let bullets: string[] = [];
                        try {
                            bullets = JSON.parse(s.bullets);
                        } catch (e) {
                            console.error("Failed to parse bullets JSON", e);
                        }

                        return (
                            <div key={s.key} className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 ${isReversed ? '' : ''}`}>
                                {/* Image */}
                                <div className={isReversed ? 'order-1 lg:order-2' : 'order-1'}>
                                    <div className="w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200">
                                        <div
                                            className="aspect-video w-full bg-cover bg-center"
                                            style={{ backgroundImage: `url('${s.image}')` }}
                                            data-alt={s.image_alt}
                                        />
                                    </div>
                                </div>
                                {/* Text */}
                                <div className={isReversed ? 'order-2 lg:order-1' : 'order-2'}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined text-3xl">{s.icon}</span>
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight">{s.title}</h2>
                                    </div>
                                    <p className="mt-4 text-lg text-slate-600">{s.description}</p>
                                    <ul className="mt-6 space-y-4 text-slate-600">
                                        {bullets.map(b => (
                                            <li key={b} className="flex items-start gap-3">
                                                <span className="material-symbols-outlined mt-1 text-lg text-primary">check_circle</span>
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <a href={`/services/${s.slug || s.key}`} className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                                        Learn More <span className="material-symbols-outlined ml-2">arrow_forward</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServiceDetails;
