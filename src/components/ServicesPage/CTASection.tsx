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
        <section className="py-20 sm:py-32">
            <div className="mx-auto max-w-5xl">
                <div className="relative overflow-hidden rounded-xl bg-slate-800 p-8 text-center md:p-12">
                    <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/20" />
                    <div className="absolute -bottom-24 -left-12 size-64 rounded-full bg-primary/10" />
                    <div className="relative flex flex-col items-center gap-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{data.title}</h2>
                        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">{data.description}</p>
                        <CTAButton text={data.button_text} href={data.button_link} variant="primary" className="mt-4 shadow-sm" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
