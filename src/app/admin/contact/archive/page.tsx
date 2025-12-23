"use client";

import { useEffect, useMemo, useState } from "react";
import { showToast } from '@/components/Toast';

type Submission = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    service?: string | null;
    message: string;
    status: string;
    createdAt: string;
};

type StatusKey = "new" | "read" | "replied" | "archived" | string;

const statusOptions: StatusKey[] = ["archived", "new", "read", "replied"];

const statusConfig = {
    new: { bg: "bg-blue-50", text: "text-blue-700", icon: "mail", dot: "bg-blue-500" },
    read: { bg: "bg-amber-50", text: "text-amber-700", icon: "drafts", dot: "bg-amber-500" },
    replied: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "done_all", dot: "bg-emerald-500" },
    archived: { bg: "bg-slate-50", text: "text-slate-700", icon: "archive", dot: "bg-slate-400" },
};

export default function ContactArchivePage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selected, setSelected] = useState<Submission | null>(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/pages/contact/submissions?status=archived", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load submissions");
            setSubmissions(data as Submission[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return submissions;
        return submissions.filter((s) => [s.name, s.email, s.phone || "", s.service || s.subject || "", s.message].some((f) => f.toLowerCase().includes(term)));
    }, [search, submissions]);

    const formatDate = (value: string) => {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Invalid Date';
        }
    };

    const handleStatusChange = async (id: number, status: StatusKey) => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/pages/contact/submissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update status");
            setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)).filter((s) => s.status === "archived"));
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Could not update status", { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="flex h-screen p-5 flex-col gap-6">
            {/* Header */}
            <div className=" backdrop-blur-sm py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Archive</h1>
                        <p className="text-sm text-slate-600 mt-1">Archived contact submissions</p>
                    </div>
                    <a
                        href="/admin/contact"
                        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-slate-900 to-slate-800 text-white px-4 py-2.5 text-sm font-semibold hover:shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">reply_all</span>
                        Back
                    </a>
                </div>
            </div>

            {/* Controls */}
            <div className="border-b border-slate-200/50 bg-white/50 backdrop-blur-sm py-5 flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search archived messages..."
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <button
                    onClick={fetchSubmissions}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all shadow-sm"
                    disabled={loading}
                >
                    <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>refresh</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 rounded-lg border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-800 flex items-start gap-3 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-base mt-0.5">error</span>
                    {error}
                </div>
            )}

            {/* Submissions Table */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                            <p className="text-sm text-slate-600">Loading archived submissions...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4 text-6xl">📦</div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No archived submissions</h3>
                            <p className="text-sm text-slate-600">Archive is empty!</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full table-fixed">
                        <thead className="bg-slate-50 border-y border-slate-200 sticky top-0">
                            <tr>
                                <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                                <th className="w-44 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                                <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                                <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service</th>
                                <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                <th className="w-36 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                                <th className="w-36 px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filtered.map((s) => (
                                <tr
                                    key={s.id}
                                    onClick={() => setSelected(s)}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 truncate">{s.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 truncate">{s.email}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 font-mono truncate">{s.phone || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700 truncate">{s.service || s.subject || '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[s.status as keyof typeof statusConfig]?.bg} ${statusConfig[s.status as keyof typeof statusConfig]?.text}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[s.status as keyof typeof statusConfig]?.dot}`} />
                                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                            <select
                                                value={s.status}
                                                onChange={(e) => {
                                                    handleStatusChange(s.id, e.target.value);
                                                }}
                                                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                                disabled={updatingId === s.id}
                                            >
                                                {statusOptions.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={(e) => {
                                                    handleStatusChange(s.id, "new");
                                                }}
                                                disabled={updatingId === s.id}
                                                className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Restore to inbox"
                                            >
                                                <span className="material-symbols-outlined text-sm">undo</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                    <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                            <h2 className="text-xl font-semibold text-slate-900">{selected.service || selected.subject || 'Message Details'}</h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Name</label>
                                    <p className="text-sm text-slate-900 mt-1">{selected.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Email</label>
                                    <p className="text-sm text-slate-900 mt-1">{selected.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Phone</label>
                                    <p className="text-sm text-slate-900 mt-1">{selected.phone || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Service</label>
                                    <p className="text-sm text-slate-900 mt-1">{selected.service || selected.subject || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Status</label>
                                    <p className="text-sm text-slate-900 mt-1">{selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Date</label>
                                    <p className="text-sm text-slate-900 mt-1">{formatDate(selected.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Message</label>
                                    <p className="text-sm text-slate-900 mt-1 whitespace-pre-wrap">{selected.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mr-2">Change Status:</label>
                                <select
                                    value={selected.status}
                                    onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
                                    disabled={updatingId === selected.id}
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleStatusChange(selected.id, "new");
                                        setSelected(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800"
                                >
                                    Restore
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
