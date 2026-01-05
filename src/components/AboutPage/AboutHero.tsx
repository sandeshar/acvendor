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
    is_active: number;
    updatedAt: Date;
}

interface AboutHeroProps {
    data?: AboutHeroData | null;
}

const AboutHero = ({ data }: AboutHeroProps) => {
    if (!data) return null;

    const bgUrl = data.hero_image || '';

    return (
        <section className="w-full">
            <div className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4" data-alt={data.hero_image_alt || ''} style={{ backgroundImage: bgUrl ? `linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url("${bgUrl}")` : undefined }}>
                <div className="flex flex-col gap-4 text-center max-w-[800px]">
                    {data.badge_text && (
                        <div className="inline-flex w-fit mx-auto items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            {data.badge_text}
                        </div>
                    )}
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl">{data.title}</h1>
                    {data.description ? (
                        <h2 className="text-gray-200 text-base font-normal leading-normal md:text-lg max-w-2xl mx-auto">
                            {data.description}
                        </h2>
                    ) : null}
                </div>

                <div className="flex gap-4 mt-4">
                    {data.button1_text && data.button1_link ? (
                        <a href={data.button1_link} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors shadow-lg">
                            <span className="truncate">{data.button1_text}</span>
                        </a>
                    ) : null}

                    {data.button2_text && data.button2_link ? (
                        <a href={data.button2_link} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white/10 backdrop-blur-sm border border-white text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors">
                            <span className="truncate">{data.button2_text}</span>
                        </a>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default AboutHero;
