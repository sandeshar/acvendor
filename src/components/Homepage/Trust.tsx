interface TrustSectionData {
    id: number;
    heading: string;
    is_active: number;
    updatedAt: Date;
}

interface TrustLogoData {
    _id?: string;
    id?: number;
    alt_text: string;
    logo_url: string;
    invert: number;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface TrustProps {
    section?: TrustSectionData | null;
    logos?: TrustLogoData[];
}

const Trust = ({ section, logos = [] }: TrustProps) => {
    if (!section || logos.length === 0) {
        return null;
    }

    return (
        <section className="px-4 md:px-10 py-20 sm:py-32">
            <h4 className="text-subtext text-sm font-bold leading-normal tracking-[0.015em] text-center pb-8">{section.heading}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
                {logos.map((logo, i) => (
                    <img
                        key={logo._id ?? logo.id ?? logo.logo_url ?? i}
                        alt={logo.alt_text}
                        className={`h-60 w-auto mx-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all ${logo.invert ? 'invert opacity-40 hover:opacity-100' : ''}`}
                        src={logo.logo_url}
                    />
                ))}
            </div>
        </section>
    );
};

export default Trust;