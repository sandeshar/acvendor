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
                <p className="text-white/70 text-lg max-w-xl">
                    {data.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <a href={data.primary_button_link || '#'} className="inline-block bg-white text-primary hover:bg-primary-50 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg transition-all active:scale-95">
                        {data.primary_button_text}
                    </a>
                    {data.secondary_button_text && (
                        <a href={data.secondary_button_link || '#'} className="inline-block bg-primary-600 text-white border border-white/20 hover:bg-primary-700 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg transition-all active:scale-95">
                            {data.secondary_button_text}
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AboutCTA;
