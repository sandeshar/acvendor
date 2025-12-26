import React from 'react';

interface CertificationItem {
    id?: number;
    name: string;
    logo?: string;
    link?: string;
    display_order?: number;
    is_active?: number;
}

interface CertificationsSection {
    id?: number;
    title?: string;
    subtitle?: string;
    is_active?: number;
}

import { DEFAULT_CERTIFICATIONS, DEFAULT_CERTIFICATIONS_SECTION } from '@/db/aboutPageDefaults';

const AboutCertifications = ({ certifications = [], section }: { certifications?: CertificationItem[]; section?: CertificationsSection | null }) => {
    const items = (certifications && certifications.length > 0) ? certifications : DEFAULT_CERTIFICATIONS;
    const sec = section || DEFAULT_CERTIFICATIONS_SECTION;

    return (
        <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12 bg-background-light border-t border-[#e5e7eb]">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                <div className="flex flex-col gap-8 text-center">
                    <h3 className="text-[#111418] text-2xl font-bold">{sec.title}</h3>
                    <p className="text-sm text-[#617589] mt-2">{sec.subtitle}</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 mt-6">
                        {items.map((c, idx) => (
                            <a key={c.id || c.name || idx} href={c.link || '#'} className="flex items-center gap-3 text-xl font-bold text-[#333] hover:opacity-90">
                                {c.logo ? (
                                    <img src={c.logo} alt={c.name} className="h-8 w-auto object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-3xl">apartment</span>
                                )}
                                <span>{c.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutCertifications;
