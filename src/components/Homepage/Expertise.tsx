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
        <section className="flex flex-col gap-10 px-4 md:px-10 py-20 sm:py-32 @container">
            <div className="flex flex-col gap-4 text-center items-center">
                <h1
                    className="text-body tracking-light text-3xl font-bold leading-tight @[480px]:text-4xl @[480px]:font-black max-w-2xl">
                    {section.title}
                </h1>
                <p className="text-subtext text-base font-normal leading-normal max-w-2xl">
                    {section.description}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-0">
                {items.map((item, i) => (
                    <div
                        key={item._id ?? item.id ?? item.title ?? i}
                        className="flex flex-1 gap-4 rounded-xl border border-muted bg-card p-6 flex-col"
                    >
                        <span className="material-symbols-outlined text-primary-var text-3xl">{item.icon}</span>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-body text-lg font-bold leading-tight">{item.title}</h2>
                            <p className="text-subtext text-sm font-normal leading-normal">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Expertise;