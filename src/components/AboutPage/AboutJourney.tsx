import React from 'react';
import StatCard from './StatCard';
import FeatureCard from './FeatureCard';
import AboutFeatures from './AboutFeatures';
import AboutCertifications from './AboutCertifications';

interface AboutJourneySectionData {
    id: number;
    title: string;
    paragraph1: string;
    paragraph2: string;
    thinking_box_title?: string;
    thinking_box_content?: string;
    highlights?: string[];
    // Optional section image and alt text
    hero_image?: string;
    hero_image_alt?: string;
    is_active: number;
    updatedAt: Date;
}

interface AboutStatData {
    id: number;
    label: string;
    value: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface AboutFeatureData {
    id: number;
    title: string;
    description: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface AboutJourneyProps {
    section?: AboutJourneySectionData | null;
    stats?: AboutStatData[];
    features?: AboutFeatureData[];
    badges?: any[];
    certifications?: any[];
    certificationsSection?: { title?: string; subtitle?: string } | null;
}

const DEFAULT_HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDda5biMwpMvtX_h7btShwaroEUJ1ijOwryycUDayNUEpgCs5Get0Ep6MoDB5u_3rw9c-R5gRyZWYnGqHuoiqBOTd3JUyVZuq0UUXI8R2BUjuY5HIq_-4V_ckfdOBetgRgNaf-rpTdE7AtC-rxH-KYR9y4D8oTpDqs_FSBTaaWChdJ0ilJKnKdEc2PzxxHoZixugfmxmKMdJ_Stnxg81KaJVzEjzoOwjuv-RFS4_nBIQkPZForGEXJHgs8q0H05VzwwvwgkkURRlMg';
const DEFAULT_HIGHLIGHTS = ['ISO 9001:2015 Certified', 'Authorized Distributor'];
const DEFAULT_STATS: AboutStatData[] = [
    { id: -1, label: 'Installations', value: '5000+', display_order: 1, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -2, label: 'Years Experience', value: '15+', display_order: 2, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -3, label: 'Certified Techs', value: '50+', display_order: 3, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -4, label: 'Client Satisfaction', value: '100%', display_order: 4, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
];

const AboutJourney = ({ section, stats = [], features = [], badges = [], certifications = [], certificationsSection = null }: AboutJourneyProps) => {
    if (!section) {
        return null;
    }

    return (
        <>
            {/* Company Profile / Story Section (Split Layout) */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-16 bg-white">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Story</span>
                                <h2 className="text-[#111418] text-3xl md:text-4xl font-bold leading-tight">
                                    {section.title || 'Bringing Comfort to Every Nepali Home & Business'}
                                </h2>
                            </div>

                            <p className="text-[#617589] text-base leading-relaxed">
                                {section.paragraph1}
                            </p>
                            <p className="text-[#617589] text-base leading-relaxed">
                                {section.paragraph2}
                            </p>

                            <div className="flex gap-4 mt-2">
                                {(section.highlights && section.highlights.length > 0 ? section.highlights : DEFAULT_HIGHLIGHTS).map((h, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        <span className="text-sm font-medium">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative h-full min-h-[300px] w-full rounded-xl overflow-hidden shadow-xl group">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10"></div>
                            <div className="h-full w-full bg-cover bg-center" data-alt={section?.hero_image_alt || 'Team of professionals'} style={{ backgroundImage: section?.hero_image ? `url("${section.hero_image}")` : `url("${DEFAULT_HERO_IMAGE}")` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-10 bg-primary/5">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                        {(stats && stats.length > 0 ? stats : DEFAULT_STATS).map((s) => (
                            <StatCard key={s.id} value={s.value} label={s.label} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-16 bg-white">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-col gap-10 px-4 py-4">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <h2 className="text-[#111418] tracking-tight text-[32px] font-bold leading-tight md:text-4xl">{section.thinking_box_title || 'Why Choose Nepal AC Solutions?'}</h2>
                            <p className="text-[#617589] text-base font-normal leading-normal max-w-[720px]">{section.thinking_box_content || 'We combine international quality standards with deep local knowledge to deliver superior cooling solutions.'}</p>
                        </div>

                        <AboutFeatures features={features} />
                    </div>
                </div>
            </section>

            {/* Badges strip */}
            {badges && badges.length > 0 && (
                <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8 bg-background-light">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <div className="flex items-center justify-center gap-6 flex-wrap">
                            {badges.map((b) => (
                                <a key={b.id || b.name} href={b.link || '#'} className="flex items-center gap-3 p-2 opacity-80 hover:opacity-100">
                                    {b.logo ? (
                                        <img src={b.logo} alt={b.name} className="h-10 object-contain" />
                                    ) : (
                                        <span className="text-sm font-bold">{b.name}</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Certifications & Clients Section */}
            <AboutCertifications certifications={certifications} section={certificationsSection} />
        </>
    );
};

export default AboutJourney;
