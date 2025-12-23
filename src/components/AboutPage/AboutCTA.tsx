import CTAButton from '../shared/CTAButton';

interface AboutCTAData {
    id: number;
    title: string;
    description: string;
    primary_button_text: string;
    primary_button_link: string;
    secondary_button_text: string;
    secondary_button_link: string;
    is_active: number;
    updatedAt: Date;
}

interface AboutCTAProps {
    data?: AboutCTAData | null;
}

const AboutCTA = ({ data }: AboutCTAProps) => {
    if (!data) {
        return null;
    }

    return (
        <section className="w-full py-20 sm:py-32">
            <div className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-2xl bg-card px-8 py-16 shadow-lg lg:px-16 lg:py-20">
                    {/* accent stripe to ensure contrast with page background */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary-20" aria-hidden></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />
                    <div className="relative z-10 mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-black leading-tight tracking-[-0.02em] text-body md:text-5xl">
                            {data.title}
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-subtext">
                            {data.description}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <CTAButton text={data.primary_button_text} href={data.primary_button_link} variant="primary" className="bg-primary text-white shadow-xl" />
                            <CTAButton text={data.secondary_button_text} href={data.secondary_button_link} variant="outline" className="border border-primary text-primary hover:bg-primary/10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutCTA;
