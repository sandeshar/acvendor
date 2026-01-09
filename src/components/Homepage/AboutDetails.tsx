import React from 'react';

interface AboutItem {
    _id?: string;
    id?: string | number;
    title: string;
    description: string;
    bullets: string; // JSON string
    image_url?: string;
    image_alt?: string;
    cta_text?: string;
    cta_link?: string;
    display_order?: number;
    is_active?: number;
}

interface AboutDetailsProps {
    items?: AboutItem[];
}

const AboutDetails = ({ items = [] }: AboutDetailsProps) => {
    if (!items || items.length === 0) return null;

    return (
        <section className="px-4 md:px-10 py-20">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-16 lg:gap-24">
                    {items.map((s, idx) => {
                        const isReversed = idx % 2 === 1;
                        let bullets: string[] = [];
                        try {
                            bullets = JSON.parse(s.bullets || '[]');
                        } catch (e) {
                            console.error('Failed to parse about bullets', e);
                        }

                        return (
                            <div key={s._id || s.id || idx} className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
                                <div className={isReversed ? 'order-1 lg:order-2' : 'order-1'}>
                                    <div className="w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200">
                                        <div
                                            className="aspect-video w-full bg-cover bg-center"
                                            style={{ backgroundImage: `url('${s.image_url || ''}')` }}
                                            data-alt={s.image_alt}
                                        />
                                    </div>
                                </div>
                                <div className={isReversed ? 'order-2 lg:order-1' : 'order-2'}>
                                    <h3 className="text-3xl font-bold tracking-tight">{s.title}</h3>
                                    <p className="mt-4 text-lg text-slate-600">{s.description}</p>
                                    <ul className="mt-6 space-y-4 text-slate-600">
                                        {bullets.map((b, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="material-symbols-outlined mt-1 text-lg text-primary">check_circle</span>
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {s.cta_text && s.cta_link && (
                                        <div className="mt-8">
                                            <a
                                                href={s.cta_link}
                                                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all duration-200"
                                            >
                                                {s.cta_text}
                                                <span className="material-symbols-outlined ml-2 text-[18px]">arrow_forward</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default AboutDetails;