import CTAButton from '../shared/CTAButton';

interface ServicesCTAData {
    id: number;
    title: string;
    description: string;
    button_text: string;
    button_link: string;
    is_active: number;
    updatedAt: Date;
}

interface CTASectionProps {
    data?: ServicesCTAData | null;
}

const CTASection = ({ data }: CTASectionProps) => {
    if (!data) {
        return null;
    }

    return (
        <section className="px-4 md:px-10 py-16 sm:py-24 bg-primary">
            <div className="mx-auto max-w-5xl">
                <div className="relative overflow-hidden text-center">
                    <div className="relative flex flex-col items-center gap-6">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{data.title}</h2>
                        <p className="max-w-2xl text-lg text-primary-100 sm:text-xl text-white/80">{data.description}</p>
                        <a
                            href={data.button_link || '#'}
                            className="mt-4 inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-primary-50 transition shadow-xl active:scale-95"
                        >
                            {data.button_text}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
