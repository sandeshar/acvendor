import CTAButton from '../shared/CTAButton';

interface ServicesHeroData {
    id: number;
    tagline: string;
    title: string;
    description: string;
    badge_text?: string;
    highlight_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image?: string;
    hero_image_alt?: string;
    stat1_value?: string;
    stat1_label?: string;
    stat2_value?: string;
    stat2_label?: string;
    stat3_value?: string;
    stat3_label?: string;
    is_active: number;
    updatedAt: Date;
}

interface HeroSectionProps {
    data?: ServicesHeroData | null;
}

const HeroSection = ({ data }: HeroSectionProps) => {
    if (!data) {
        return null;
    }

    return (
        <section className="relative w-full min-h-[calc(100vh-60px)] flex items-center overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 xl:gap-32 items-center justify-items-center lg:justify-items-stretch">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
                        {data.badge_text && (
                            <div className="inline-flex items-center gap-2 self-start rounded-full bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-var ring-1 ring-muted transition-transform hover:scale-105 mb-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                {data.badge_text}
                            </div>
                        )}

                        {data.tagline && (
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-primary-var">
                                {data.tagline}
                            </p>
                        )}

                        <h1 className="text-body text-3xl font-black leading-[1.05] tracking-[-0.033em] md:text-4xl lg:text-5xl xl:text-6xl">
                            {data.title.split('\n').map((line, i) => {
                                const hl = data.highlight_text || '';
                                const idx = hl ? line.indexOf(hl) : -1;
                                if (idx === -1) {
                                    return <span key={i} className="block">{line}</span>;
                                }
                                return (
                                    <span key={i} className="block">
                                        {line.substring(0, idx)}
                                        <span className="relative whitespace-nowrap">
                                            <span className="relative z-10 bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-600 to-indigo-600">{hl}</span>
                                        </span>
                                        {line.substring(idx + hl.length)}
                                    </span>
                                );
                            })}
                        </h1>

                        <p className="mt-2 text-subtext text-sm font-normal leading-relaxed md:text-base xl:text-lg max-w-2xl">{data.description}</p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <a href={data.primary_cta_link || '#'} aria-label={data.primary_cta_text}>
                                <CTAButton text={data.primary_cta_text || 'Get Started Now'} variant="primary" className="rounded-xl h-10 md:h-12 px-4 md:px-6 xl:h-14 xl:px-8 shadow-lg shadow-primary/25 hover:-translate-y-1 transition-all duration-300" />
                            </a>
                            {data.secondary_cta_text && (
                                <a href={data.secondary_cta_link || '#'} aria-label={data.secondary_cta_text}>
                                    <CTAButton text={data.secondary_cta_text} variant="secondary" className="rounded-xl h-10 md:h-12 px-4 md:px-6 xl:h-14 xl:px-8" />
                                </a>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-muted grid grid-cols-3 gap-6 w-full">
                            <div>
                                <p className="text-3xl font-extrabold text-body">{data.stat1_value || ''}</p>
                                <p className="text-sm font-semibold text-subtext mt-1">{data.stat1_label || ''}</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-slate-900">{data.stat2_value || ''}</p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">{data.stat2_label || ''}</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-slate-900">{data.stat3_value || ''}</p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">{data.stat3_label || ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:pl-10 mt-6 lg:mt-0 w-full">
                        <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[560px] xl:h-[72vh] overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-muted group transform transition-transform hover:scale-[1.01] duration-500">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${data.background_image}")` }} role="img" aria-label={data.hero_image_alt || 'Hero image'}></div>
                            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-20 blur-3xl transition-all duration-700 animate-pulse"></div>
                            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary-20 blur-3xl transition-all duration-700 animate-pulse delay-700"></div>
                            <div className="relative h-full w-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${data.background_image}")` }} />

                            <div className="absolute -left-6 bottom-20 z-20 hidden md:block">
                                <div className="flex items-center gap-4 rounded-xl bg-card p-4 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 border border-muted">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-subtext">Traffic Growth</p>
                                        <p className="text-xl font-black text-body">+145%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-6 top-20 z-20 hidden md:block">
                                <div className="flex items-center gap-4 rounded-xl bg-white/90 p-4 pr-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 border border-white/20">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                                        <span className="material-symbols-outlined">article</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Content Pieces</p>
                                        <p className="text-xl font-black text-slate-900">5k+</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
