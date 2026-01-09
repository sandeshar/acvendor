interface ExpertiseSectionData {
    id: number;
    title: string;
    description: string;
    is_active: number;
    updatedAt: Date;
}

interface ExpertiseItemData {
    _id?: string;
    id?: number;
    icon: string;
    title: string;
    description: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ExpertiseProps {
    section?: ExpertiseSectionData | null;
    items?: ExpertiseItemData[];
}

const Expertise = ({ section, items = [] }: ExpertiseProps) => {
    if (!section || items.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-white py-20" id="services">
            <div className="layout-container flex justify-center px-4 md:px-10">
                <div className="flex flex-col w-full max-w-7xl gap-12">
                    <div className="flex flex-col gap-4 text-center md:text-left">
                        <h2 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight">
                            {section.title || 'Our Expertise'}
                        </h2>
                        <p className="text-[#617589] text-lg max-w-[720px]">
                            {section.description || 'Comprehensive cooling services for homes and businesses across Kathmandu Valley. We handle everything from setup to maintenance.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((item, i) => (
                            <div
                                key={item._id ?? item.id ?? item.title ?? i}
                                className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary bg-blue-100 text-blue-500 transition-colors">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-[#111418]">{item.title}</h3>
                                    <p className="text-sm text-[#617589] leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expertise;