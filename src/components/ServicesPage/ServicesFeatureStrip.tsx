interface FeatureItem { id?: number; icon: string; title: string; description: string; }

const ServicesFeatureStrip = ({ items = [] }: { items?: FeatureItem[] }) => {
    const hasItems = items && items.length > 0;

    const renderCard = (item: FeatureItem, idx: number) => (
        <div key={item.id ?? idx} className="flex items-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-3xl">{item.icon || 'verified_user'}</span>
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white border-b border-gray-100 py-8 relative -mt-8 mx-4 md:mx-auto max-w-[1100px] rounded-xl shadow-lg z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {hasItems ? items.slice(0, 3).map((it, i) => renderCard(it, i)) : (
                    // fallback hardcoded content
                    <>
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-3xl">verified_user</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Certified Experts</h3>
                                <p className="text-sm text-slate-500">Trained technicians for all major brands.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-3xl">avg_pace</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Fast Response</h3>
                                <p className="text-sm text-slate-500">Same-day service available in Kathmandu.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined text-3xl">handyman</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Genuine Parts</h3>
                                <p className="text-sm text-slate-500">100% original spare parts warranty.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServicesFeatureStrip;