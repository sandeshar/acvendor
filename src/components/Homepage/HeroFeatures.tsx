interface HeroFeature {
    _id: string;
    icon_name: string;
    title: string;
    description: string;
    icon_bg?: string;
}

export default function HeroFeatures({ features }: { features: HeroFeature[] }) {
    if (!features || features.length === 0) return null;

    return (
        <section className="relative z-20 -mt-16 md:mx-auto w-[calc(100%-2rem)] md:w-full max-w-[1100px] mb-16">
            <div className="bg-white border-b border-gray-100 py-8 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {features.map((feature) => (
                        <div key={feature._id} className="flex items-center gap-5 py-2 md:px-4 first:pl-0 last:pr-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-5xl leading-none">
                                    {feature.icon_name}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
