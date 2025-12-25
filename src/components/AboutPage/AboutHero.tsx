import CTAButton from '../shared/CTAButton';
import StarIcon from '../shared/StarIcon';

interface AboutHeroData {
    id: number;
    title: string;
    description: string;
    button1_text: string;
    button1_link: string;
    button2_text: string;
    button2_link: string;
    hero_image: string;
    hero_image_alt: string;
    badge_text?: string;
    highlight_text?: string;
    float_top_enabled?: number;
    float_top_icon?: string;
    float_top_title?: string;
    float_top_value?: string;
    float_bottom_enabled?: number;
    float_bottom_icon?: string;
    float_bottom_title?: string;
    float_bottom_value?: string;
    rating_text?: string;
    is_active: number;
    updatedAt: Date;
}

interface AboutHeroProps {
    data?: AboutHeroData | null;
}

const AboutHero = ({ data }: AboutHeroProps) => {
    if (!data) return null;

    const bgUrl = data.hero_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv0fBejiBkcLPEszz_7Ej5rLaR5e_PlV5xlM91Sg2kZHE1gA6gtqHubWVNHJmsmbdajzgYdV4Srv710xbRYUr7B4vFCdV6KoLe7NsV74KjtGuyHgSyHNAvsPAwvt-_CZ1LDYzCzOFOADBOTUBbENcxvf1yHQT9ZPfj5YV_3yNNoPVFfY09OF3gNyGFl12CIzb0k7ktxHBibAzgfSHbCetKCcOcKcYNPwmIBL96qwgOBbSDtZYED-DK6LNqkSO2bCSI8hkZu6udJqY';

    return (
        <section className="w-full">
            <div className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4" data-alt={data.hero_image_alt || 'Modern air conditioning unit installation on a rooftop in Kathmandu with mountains in the background'} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url("${bgUrl}")` }}>
                <div className="flex flex-col gap-4 text-center max-w-[800px]">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl">
                        {data.title || 'Cooling Nepal Since 2010'}
                    </h1>
                    <h2 className="text-gray-200 text-base font-normal leading-normal md:text-lg max-w-2xl mx-auto">
                        {data.description || 'Expert climate control for Nepal\'s unique weather. We provide trusted residential and commercial HVAC solutions from Kathmandu to Pokhara.'}
                    </h2>
                </div>

                <div className="flex gap-4 mt-4">
                    <a href={data.button1_link || '#'} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors shadow-lg">
                        <span className="truncate">{data.button1_text || 'View Our Services'}</span>
                    </a>
                    <a href={data.button2_link || '#'} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white/10 backdrop-blur-sm border border-white text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors">
                        <span className="truncate">{data.button2_text || 'Contact Us'}</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
