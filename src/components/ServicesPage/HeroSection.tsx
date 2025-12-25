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

    const bgUrl = data.background_image || '';

    return (
        <section className="relative bg-white">
            <div className="relative w-full h-[500px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" data-alt={data.hero_image_alt || 'Technician repairing air conditioner unit on a wall'} style={{ backgroundImage: `url("${bgUrl}")` }} />
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/90 to-slate-900/40" />

                {/* Content */}
                <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                    <div className="max-w-2xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm text-white">{data.badge_text || '#1 AC Service in Nepal'}</span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">{data.title || 'Expert Cooling Solutions for Nepal\u2019s Climate'}</h1>

                        <p className="text-lg text-slate-200 mb-8 font-medium leading-relaxed max-w-xl">{data.description || data.tagline || 'From Kathmandu valleys to the Terai plains, we provide professional AC installation, repair, and maintenance for residential and commercial spaces.'}</p>

                        <div className="flex flex-wrap gap-4">
                            <a href={data.primary_cta_link || '#'} className="bg-primary hover:bg-blue-600 text-white text-base font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-primary/30 inline-flex items-center gap-2">{data.primary_cta_text || 'Get a Free Quote'} <span className="material-symbols-outlined">arrow_forward</span></a>
                            <a href={data.secondary_cta_link || '#'} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-base font-bold py-3 px-8 rounded-lg transition-all backdrop-blur-sm inline-flex items-center gap-2"><span className="material-symbols-outlined">call</span> {data.secondary_cta_text || 'Call Support'}</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
