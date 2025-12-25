const OurFoundation = () => {
    const foundations = [
        {
            icon: "rocket_launch",
            title: "Our Mission",
            description: "To empower businesses by creating compelling content that builds meaningful connections with their audience and drives tangible results."
        },
        {
            icon: "visibility",
            title: "Our Vision",
            description: "To be the leading content marketing partner in the region, renowned for our creativity, strategic insight, and unwavering client dedication."
        },
        {
            icon: "star",
            title: "Our Values",
            description: "We believe in Creativity, Integrity, and Results. These principles guide every project, ensuring we deliver work we are proud of."
        }
    ];

    return (
        <section className="w-full bg-page px-4 md:px-10 py-20 sm:py-32 lg:py-32">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col gap-12">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold leading-tight tracking-[-0.033em] text-body">
                            Our Foundation
                        </h2>
                        <p className="mx-auto mt-4 max-w-3xl text-base font-normal leading-normal text-subtext">
                            We are guided by a core set of principles that define who we are and how we work. These are the promises we make to our clients and to each other.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {foundations.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-4 rounded-xl border border-muted bg-card p-6 text-center"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-20 text-primary-var">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-bold leading-tight text-body">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm font-normal leading-normal text-subtext">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurFoundation;
