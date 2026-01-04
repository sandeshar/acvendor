import CTAButton from '../shared/CTAButton';

interface HeroData {
    id?: number;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    hero_image_alt?: string;
    badge_text?: string;
    highlight_text?: string;
    colored_word?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    rating_text?: string;
    is_active: number;
}

interface HeroProps {
    data?: HeroData | null;
}

const isValidUrl = (s: any) => {
    try {
        if (!s || typeof s !== 'string') return false;
        new URL(s);
        return true;
    } catch (e) {
        return false;
    }
};

const Hero = ({ data }: HeroProps) => {
    if (!data) return null;

    const defaultBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9qPavrX9o-kZM2q3qZwFJ5yR6tt4n1YwD_OUxwlwFVIYWNlUq9LEOlpvBTw8I6qRuX0RBjYsFxO39FcWVYKWrrajhZbQYLB-aj9ipExwGUVuT3v-iU6O10flSSmGi_mtLUkpA7irghagtxi-ovfSfHHE-eW9v6pc9XrJvXz_iO-cQEsQzeJTUr6FarmOWY7PGlqR1fBYvnOKUCdHM48_VdRTEZ2a5mAxXZftP70bSpuneuURFJ-sOon_E4rUHM7pbjzb7JTIeGFw';
    const bgUrl = isValidUrl(data.background_image) ? String(data.background_image).trim() : defaultBg;

    return (
        <div className="relative flex min-h-[calc(100vh-60px)] flex-col justify-center overflow-hidden">
            {/* Background Image with Overlay (use <img> to ensure loading and avoid CSS url parsing issues) */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img src={bgUrl} alt={data.hero_image_alt || 'Modern living room with air conditioner'} className="w-full h-full object-cover object-center" loading="eager" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>
            </div>

            <div className="layout-container relative z-10 flex justify-center px-4 md:px-10 py-0">
                <div className="flex w-full flex-col gap-6 md:gap-8">
                    <div className="flex flex-col gap-4 w-full md:w-3/4 lg:w-2/3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            {data.badge_text || '#1 AC Service Provider in Kathmandu'}
                        </div>

                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl">
                            {data.title || 'Complete Air Conditioning Solutions in Nepal'}
                        </h1>

                        <h2 className="text-gray-200 text-lg font-normal leading-relaxed max-w-none">
                            {data.subtitle || 'Authorized sales, professional installation, and expert repair for residential and commercial spaces. Stay cool and comfortable all year round.'}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <a href={data.cta_link || '#'} aria-label={data.cta_text || 'Get a Free Quote'} className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-primary px-6 text-white text-base font-bold shadow-lg hover:bg-blue-600 transition-all hover:scale-105">
                            {data.cta_text || 'Get a Free Quote'}
                        </a>
                        <a href={data.secondary_cta_link || '#'} aria-label={data.secondary_cta_text || 'WhatsApp Us'} className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-6 text-white text-base font-bold hover:bg-white/20 transition-all">
                            <span className="material-symbols-outlined mr-2">chat</span>
                            {data.secondary_cta_text || 'WhatsApp Us'}
                        </a>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="material-symbols-outlined text-primary">engineering</span>
                            <span className="text-sm font-medium">Certified Techs</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                            <span className="text-sm font-medium">1 Year Warranty</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="material-symbols-outlined text-primary">schedule</span>
                            <span className="text-sm font-medium">Same Day Service</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;