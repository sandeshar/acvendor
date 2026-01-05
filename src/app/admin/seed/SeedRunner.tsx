"use client";

import { useState, useEffect } from "react";

type SeedResults = Record<string, { success: boolean; message?: string; details?: string }>;

type SeedResponse = {
    success?: boolean;
    message?: string;
    results?: SeedResults;
    error?: string;
    details?: string;
};

const SeedRunner = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<SeedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [individualLoading, setIndividualLoading] = useState<string | null>(null);
    const [individualResults, setIndividualResults] = useState<SeedResults>({});
    const [individualOptions, setIndividualOptions] = useState<Record<string, { clean?: boolean }>>({});
    const [availableBrands, setAvailableBrands] = useState<any[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>('');

    // Fetch brands for seeding options
    useEffect(() => {
        fetch('/api/pages/services/brands').then(r => r.ok ? r.json() : []).then(d => setAvailableBrands(d || [])).catch(() => { });
    }, []);

    const seedTargets = [
        { key: "status", label: "Status (Required First)", priority: true },
        { key: "users", label: "Users", priority: true },
        { key: "homepage", label: "Homepage" },
        { key: "about", label: "About" },
        { key: "services", label: "Services" },
        { key: "products", label: "Products (Sample)" },
        { key: "contact", label: "Contact" },
        { key: "faq", label: "FAQ" },
        { key: "terms", label: "Terms" },
        { key: "blog", label: "Blog" },
        { key: "navbar", label: "Navbar" },
        { key: "footer", label: "Footer" },
    ];

    const runSeed = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);
        try {
            const res = await fetch("/api/seed/all", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand: selectedBrand || undefined }) });
            const data: SeedResponse = await res.json().catch(() => ({} as SeedResponse));
            // Always set the response so the UI can show per-seeder results and details
            setResponse(data);
            if (!res.ok) {
                setError(data.error || data.message || "Seeding failed — check results for details");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to run seed");
        } finally {
            setLoading(false);
        }
    };

    const runIndividualSeed = async (key: string) => {
        setIndividualLoading(key);
        setError(null);
        try {
            const opts = individualOptions[key] || {};
            const params = new URLSearchParams();
            if (opts.clean) params.set('clean', '1');
            // Support brand parameter for products and services seeders
            if ((key === 'products' || key === 'services') && selectedBrand) params.set('brand', selectedBrand);
            const query = params.toString() ? `?${params.toString()}` : '';
            const url = `/api/seed/${key}${query}`;
            const res = await fetch(url, { method: "POST" });
            const data: SeedResponse = await res.json().catch(() => ({} as SeedResponse));
            const success = res.ok;
            let message = data.message || data.error || (success ? "Seeded successfully" : "Seeding failed");
            // Attach details if provided by the API
            const details = (data as any).details;
            if (details) {
                message = `${message} — ${details}`;
            }
            setIndividualResults((prev) => ({
                ...prev,
                [key]: { success, message, details },
            }));
        } catch (err) {
            setIndividualResults((prev) => ({
                ...prev,
                [key]: { success: false, message: err instanceof Error ? err.message : "Unable to run seed" },
            }));
        } finally {
            setIndividualLoading(null);
        }
    };

    return (
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900">One-click seed</p>
                    <p className="text-sm text-slate-600">Runs `/api/seed/all` and reports each section.</p>
                </div>
                <button
                    type="button"
                    onClick={runSeed}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Seeding..." : "Run seed"}
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {response && (
                <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                        {response.message || response.error || "Seed completed."}
                        {response.details && (
                            <div className="text-xs mt-1 text-amber-700">{response.details}</div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {response.results &&
                            Object.entries(response.results).map(([key, value]) => (
                                <div
                                    key={key}
                                    className={`rounded-lg border px-3 py-2 text-sm ${value.success
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : "border-amber-200 bg-amber-50 text-amber-800"
                                        }`}
                                >
                                    <div className="font-semibold capitalize">{key}</div>
                                    <div>
                                        {value.message}
                                        {value.details && (
                                            <div className="text-xs mt-1 text-amber-700">{value.details}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Individual seeders</p>
                        <p className="text-sm text-slate-600">Run a specific section without touching others.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Brand:</label>
                        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="h-9 rounded-lg border-gray-200 text-sm bg-white text-[#111418] focus:ring-primary focus:border-primary">
                            <option value="">(none)</option>
                            {availableBrands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {seedTargets.map(({ key, label, priority }) => {
                        const itemState = individualResults[key];
                        return (
                            <div key={key} className={`flex flex-col gap-2 rounded-lg border p-3 ${priority ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-semibold ${priority ? 'text-primary' : 'text-slate-900'}`}>{label}</p>
                                    {itemState && (
                                        <span className={`text-xs font-semibold ${itemState.success ? "text-emerald-700" : "text-amber-700"}`}>
                                            {itemState.success ? "Success" : "Check"}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-600 min-h-8">
                                    {itemState ? itemState.message : "Not run yet."}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Show clean toggle for products and services */}
                                    {(key === 'products' || key === 'services') && (
                                        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                                            <input type="checkbox" checked={!!individualOptions[key]?.clean} onChange={(e) => setIndividualOptions((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), clean: e.target.checked } }))} />
                                            <span>Clean before seed</span>
                                        </label>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => runIndividualSeed(key)}
                                        disabled={individualLoading === key}
                                        className="inline-flex h-9 items-center justify-center rounded-lg border border-primary px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {individualLoading === key ? "Seeding..." : "Run"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SeedRunner;
