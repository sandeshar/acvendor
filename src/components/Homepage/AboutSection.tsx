import React from 'react';
import Link from 'next/link';

interface AboutSectionProps {
    section?: {
        title?: string;
        description?: string;
        bullets?: string;
        image_url?: string;
        image_alt?: string;
        cta_text?: string;
        cta_link?: string;
        // Backend sometimes sends 0, '0', or false for inactive states
        is_active?: number | boolean | string;
    } | null;
}

const AboutSection = ({ section }: AboutSectionProps) => {
    // If section is missing or explicitly inactive, don't render
    if (!section || [0, '0', false].includes(section.is_active as any)) return null;

    let bullets: string[] = [];
    try {
        if (section?.bullets) bullets = JSON.parse(section.bullets || '[]');
    } catch (e) {
        console.error('Failed to parse about bullets JSON', e);
    }

    return (
        <section className="px-4 md:px-10 pt-24" id="about">
            <div className="mx-auto max-w-7xl text-center">
                <div>
                    <h2 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight">{section?.title || 'About Us'}</h2>
                    <p className="text-[#617589] text-lg max-w-[720px] mx-auto">{section?.description || 'We deliver best-in-class AC solutions for homes and businesses across Nepal.'}</p>

                    {bullets.length > 0 && (
                        <ul className="mt-6 space-y-4 text-slate-600">
                            {bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="material-symbols-outlined mt-1 text-lg text-primary">check_circle</span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* {section?.cta_text && section?.cta_link && (
                            <a href={section.cta_link} className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90">
                                {section.cta_text} <span className="material-symbols-outlined ml-2">arrow_forward</span>
                            </a>
                        )} */}
                </div>

                {/* {section?.image_url && (
                        <div>
                            <div className="w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200">
                                <div
                                    className="aspect-video w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('${section.image_url}')` }}
                                    data-alt={section.image_alt}
                                />
                            </div>
                        </div>
                    )} */}
            </div>
        </section>
    );
};

export default AboutSection;
