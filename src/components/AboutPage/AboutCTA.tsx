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
        <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-20 bg-primary">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 text-center items-center gap-6">
                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight max-w-2xl">
                    {data.title}
                </h2>
                <p className="text-blue-100 text-lg max-w-xl">
                    {data.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <a href={data.primary_button_link || '#'} className="flex min-w-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-white text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 transition-colors shadow-lg">
                        {data.primary_button_text}
                    </a>
                    <a href={data.secondary_button_link || '#'} className="flex min-w-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary border border-white/30 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors">
                        {data.secondary_button_text}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default AboutCTA;
