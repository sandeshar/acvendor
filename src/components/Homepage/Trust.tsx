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
        <div className="w-full bg-white py-12 border-b border-[#f0f2f4]">
            <div className="layout-container flex justify-center px-4 md:px-10">
                <div className="flex flex-col items-center w-full max-w-7xl gap-8">
                    <p className="text-center text-sm font-bold uppercase tracking-wider text-gray-400">
                        {section.heading || 'Authorized Dealer For Top Brands'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {logos.map((logo, i) => (
                            <img
                                key={logo._id ?? logo.id ?? logo.logo_url ?? i}
                                alt={logo.alt_text}
                                className="h-14 md:h-20 w-auto object-contain"
                                src={logo.logo_url}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trust;