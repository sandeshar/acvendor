import CTAButton from '../shared/CTAButton';

interface ServicesHeroData {
    id: number;
    tagline: string;
    title: string;
    description: string;
    badge_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image?: string;
    hero_image_alt?: string;
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

    const bgUrl = data.background_image || '';

    const renderTitle = (title: string, highlight?: string) => {
        if (!highlight || !title.includes(highlight)) {
            return title;
        }

        const parts = title.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={i} className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <section className="relative bg-white">
            <div className="relative w-full h-[600px] overflow-hidden pb-8">
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" data-alt={data.hero_image_alt || ''} style={{ backgroundImage: `url("${bgUrl}")` }} />
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 to-slate-900/40" />

                {/* Content */}
                <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                    <div className="max-w-2xl">
                        {data.badge_text && (
                            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm text-white">
                                {data.badge_text}
                            </span>
                        )}

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                            {renderTitle(data.title)}
                        </h1>

                        <p className="text-lg text-slate-200 mb-8 font-medium leading-relaxed max-w-xl">
                            {data.description || data.tagline}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {data.primary_cta_text && (
                                <a href={data.primary_cta_link || '#'} className="bg-primary hover:bg-blue-600 text-white text-base font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-primary/30 inline-flex items-center gap-2">
                                    {data.primary_cta_text} <span className="material-symbols-outlined">arrow_forward</span>
                                </a>
                            )}
                            {data.secondary_cta_text && (
                                <a href={data.secondary_cta_link || '#'} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-base font-bold py-3 px-8 rounded-lg transition-all backdrop-blur-sm inline-flex items-center gap-2">
                                    <span className="material-symbols-outlined">call</span> {data.secondary_cta_text}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
