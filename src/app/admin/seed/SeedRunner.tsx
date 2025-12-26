"use client";

import { useState } from "react";

type SeedResults = Record<string, { success: boolean; message: string }>;

type SeedResponse = {
    success?: boolean;
    message?: string;
    results?: SeedResults;
    error?: string;
};

const SeedRunner = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<SeedResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [individualLoading, setIndividualLoading] = useState<string | null>(null);
    const [individualResults, setIndividualResults] = useState<SeedResults>({});
    const [individualOptions, setIndividualOptions] = useState<Record<string, { clean?: boolean }>>({});

    const seedTargets = [
        { key: "status", label: "Status (Required First)", priority: true },
        { key: "users", label: "Users" },
        { key: "homepage", label: "Homepage" },
        { key: "about", label: "About" },
        { key: "services", label: "Services" },
        { key: "products", label: "Products (Sample)" },
    ];

    const runSeed = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);
        try {
            const res = await fetch("/api/seed/all", { method: "POST" });
            const data: SeedResponse = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.message || "Seeding failed");
            }
            setResponse(data);
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
            const url = `/api/seed/${key}${opts.clean ? '?clean=1' : ''}`;
            const res = await fetch(url, { method: "POST" });
            const data: SeedResponse = await res.json();
            const success = res.ok;
            const message = data.message || data.error || (success ? "Seeded successfully" : "Seeding failed");
            setIndividualResults((prev) => ({
                ...prev,
                [key]: { success, message },
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
                        {response.message || "Seed completed."}
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
                                    <div>{value.message}</div>
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
                                    {/* Show clean toggle only for products seeder */}
                                    {key === 'products' && (
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
