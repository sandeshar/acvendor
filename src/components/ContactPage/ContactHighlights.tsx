const ContactHighlights = () => {
    const highlights = [
        { icon: "support_agent", title: "Dedicated Support", text: "Direct access to our strategy team." },
        { icon: "schedule", title: "Fast Turnaround", text: "Rapid replies & clear timelines." },
        { icon: "shield", title: "Secure", text: "Your data & ideas are protected." }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {highlights.map(h => (
                <div key={h.title} className="group relative flex flex-col gap-3 rounded-2xl border border-muted bg-card p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-20 text-primary-var group-hover:bg-primary/15 transition">
                        <span className="material-symbols-outlined text-2xl">{h.icon}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-body tracking-tight">{h.title}</h3>
                        <p className="text-xs text-subtext leading-relaxed">{h.text}</p>
                    </div>
                    <span className="absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
            ))}
        </div>
    );
};

export default ContactHighlights;
