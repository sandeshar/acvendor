import React from 'react';
import StatCard from './StatCard';
import FeatureCard from './FeatureCard';

interface AboutJourneySectionData {
    id: number;
    title: string;
    paragraph1: string;
    paragraph2: string;
    thinking_box_title: string;
    thinking_box_content: string;
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
}

const AboutJourney = ({ section, stats = [], features = [] }: AboutJourneyProps) => {
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
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <span className="text-sm font-medium">ISO 9001:2015 Certified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <span className="text-sm font-medium">Authorized Distributor</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-full min-h-[300px] w-full rounded-xl overflow-hidden shadow-xl group">
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10"></div>
                            <div className="h-full w-full bg-cover bg-center" data-alt="Team of professional HVAC technicians in blue uniforms discussing a blueprint" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDda5biMwpMvtX_h7btShwaroEUJ1ijOwryycUDayNUEpgCs5Get0Ep6MoDB5u_3rw9c-R5gRyZWYnGqHuoiqBOTd3JUyVZuq0UUXI8R2BUjuY5HIq_-4V_ckfdOBetgRgNaf-rpTdE7AtC-rxH-KYR9y4D8oTpDqs_FSBTaaWChdJ0ilJKnKdEc2PzxxHoZixugfmxmKMdJ_Stnxg81KaJVzEjzoOwjuv-RFS4_nBIQkPZForGEXJHgs8q0H05VzwwvwgkkURRlMg")` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-10 bg-primary/5">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                        {stats && stats.length > 0 ? stats.map((s) => (
                            <div key={s.id} className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-white shadow-sm text-center">
                                <span className="material-symbols-outlined text-primary text-4xl mb-2">ac_unit</span>
                                <p className="text-[#111418] tracking-tight text-3xl font-black leading-tight">{s.value}</p>
                                <p className="text-[#617589] text-sm font-medium leading-normal">{s.label}</p>
                            </div>
                        )) : (
                            // Defaults
                            <>
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-white shadow-sm text-center">
                                    <span className="material-symbols-outlined text-primary text-4xl mb-2">ac_unit</span>
                                    <p className="text-[#111418] tracking-tight text-3xl font-black leading-tight">5000+</p>
                                    <p className="text-[#617589] text-sm font-medium leading-normal">Installations</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-white shadow-sm text-center">
                                    <span className="material-symbols-outlined text-primary text-4xl mb-2">calendar_month</span>
                                    <p className="text-[#111418] tracking-tight text-3xl font-black leading-tight">15+</p>
                                    <p className="text-[#617589] text-sm font-medium leading-normal">Years Experience</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-white shadow-sm text-center">
                                    <span className="material-symbols-outlined text-primary text-4xl mb-2">engineering</span>
                                    <p className="text-[#111418] tracking-tight text-3xl font-black leading-tight">50+</p>
                                    <p className="text-[#617589] text-sm font-medium leading-normal">Certified Techs</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg p-6 bg-white shadow-sm text-center">
                                    <span className="material-symbols-outlined text-primary text-4xl mb-2">sentiment_satisfied</span>
                                    <p className="text-[#111418] tracking-tight text-3xl font-black leading-tight">100%</p>
                                    <p className="text-[#617589] text-sm font-medium leading-normal">Client Satisfaction</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-16 bg-white">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-col gap-10 px-4 py-4">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <h2 className="text-[#111418] tracking-tight text-[32px] font-bold leading-tight md:text-4xl">Why Choose Nepal AC Solutions?</h2>
                            <p className="text-[#617589] text-base font-normal leading-normal max-w-[720px]">We combine international quality standards with deep local knowledge to deliver superior cooling solutions.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features && features.length > 0 ? features.slice(0,3).map((feature) => (
                                <div key={feature.id} className="flex flex-1 gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">support_agent</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-[#111418] text-xl font-bold leading-tight">{feature.title}</h3>
                                        <p className="text-[#617589] text-sm font-normal leading-normal">{feature.description}</p>
                                    </div>
                                </div>
                            )) : (
                                // default features
                                <>
                                    <div className="flex flex-1 gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">support_agent</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-[#111418] text-xl font-bold leading-tight">24/7 Support</h3>
                                            <p className="text-[#617589] text-sm font-normal leading-normal">AC breakdown in the middle of summer? Our emergency repair team is on standby round-the-clock in major cities.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-[#111418] text-xl font-bold leading-tight">Genuine Parts</h3>
                                            <p className="text-[#617589] text-sm font-normal leading-normal">We guarantee 100% authentic spare parts directly from manufacturers to ensure the longevity of your system.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 gap-4 rounded-xl border border-[#dbe0e6] bg-white p-6 flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">bolt</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-[#111418] text-xl font-bold leading-tight">Energy Efficient</h3>
                                            <p className="text-[#617589] text-sm font-normal leading-normal">Our modern inverter solutions are designed to lower your electricity bills while maximizing cooling output.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications & Clients Section */}
            <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12 bg-background-light border-t border-[#e5e7eb]">
                <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                    <div className="flex flex-col gap-8 text-center">
                        <h3 className="text-[#111418] text-2xl font-bold">Trusted by Industry Leaders</h3>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 text-xl font-bold text-[#333]">
                                <span className="material-symbols-outlined text-3xl">apartment</span> Hotel Himalaya
                            </div>
                            <div className="flex items-center gap-2 text-xl font-bold text-[#333]">
                                <span className="material-symbols-outlined text-3xl">corporate_fare</span> Nepal Bank
                            </div>
                            <div className="flex items-center gap-2 text-xl font-bold text-[#333]">
                                <span className="material-symbols-outlined text-3xl">local_hospital</span> City Hospital
                            </div>
                            <div className="flex items-center gap-2 text-xl font-bold text-[#333]">
                                <span className="material-symbols-outlined text-3xl">school</span> Kathmandu Uni
                            </div>
                        </div>
                        <p className="text-sm text-[#617589] mt-4">Authorized Sales &amp; Service Partners for Major Global Brands</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutJourney;
