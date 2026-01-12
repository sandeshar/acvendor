"use client";

import { useEffect, useMemo, useState } from "react";
import { showToast } from '@/components/Toast';

type Submission = {
    id: string;
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

const statusOptions: StatusKey[] = ["new", "read", "replied", "archived"];

const statusConfig = {
    new: { bg: "bg-primary-50", text: "text-blue-700", icon: "mail", dot: "bg-primary" },
    read: { bg: "bg-amber-50", text: "text-amber-700", icon: "drafts", dot: "bg-amber-500" },
    replied: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "done_all", dot: "bg-emerald-500" },
    archived: { bg: "bg-slate-50", text: "text-slate-700", icon: "archive", dot: "bg-slate-400" },
};

export default function ContactAdminPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<StatusKey | "all">("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Submission | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/pages/contact/submissions", { cache: "no-store" });
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

    const stats = useMemo(() => {
        const base = { total: submissions.length, new: 0, read: 0, replied: 0, archived: 0 } as Record<string, number>;
        submissions.forEach((s) => {
            if (base[s.status] !== undefined) base[s.status] += 1;
        });
        return base;
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        const term = search.trim().toLowerCase();
        const base = filter === "all"
            ? submissions.filter((s) => s.status !== "archived")
            : submissions.filter((s) => s.status === filter);

        if (!term) return base;

        return base.filter((s) =>
            [s.name, s.email, s.phone || "", s.service || s.subject || "", s.message]
                .some((field) => field.toLowerCase().includes(term))
        );
    }, [filter, search, submissions]);

    const formatDate = (value: string) => {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Invalid Date';
        }
    };

    const handleStatusChange = async (id: string, status: StatusKey) => {
        setUpdatingId(id);
        try {
            const res = await fetch("/api/pages/contact/submissions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update status");

            setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Could not update status", { type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="flex p-5 h-screen w-full flex-col bg-linear-to-br">
            {/* Header */}
            <div className=" backdrop-blur-sm py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Messages</h1>
                        <p className="text-sm text-slate-600 mt-1">Manage and respond to contact submissions</p>
                    </div>
                    <a
                        href="/admin/contact/archive"
                        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-slate-900 to-slate-800 text-white px-4 py-2.5 text-sm font-semibold hover:shadow-lg hover:from-slate-800 hover:to-slate-700 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">archive</span>
                        Archive
                    </a>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        label="Total"
                        count={stats.total}
                        icon="mail"
                        color="from-primary to-blue-600"
                    />
                    <StatCard
                        label="New"
                        count={stats.new}
                        icon="mail_outline"
                        color="from-emerald-500 to-emerald-600"
                    />
                    <StatCard
                        label="Read"
                        count={stats.read}
                        icon="drafts"
                        color="from-amber-500 to-amber-600"
                    />
                    <StatCard
                        label="Replied"
                        count={stats.replied}
                        icon="done_all"
                        color="from-purple-500 to-purple-600"
                    />
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
                        placeholder="Search messages..."
                        className="w-full rounded-lg border border-slate-300/60 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as StatusKey | "all")}
                    className="rounded-lg border border-slate-300/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                >
                    <option value="all">All</option>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
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
                            <p className="text-sm text-slate-600">Loading messages...</p>
                        </div>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4 text-6xl">📭</div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No messages</h3>
                            <p className="text-sm text-slate-600">Messages will appear here</p>
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
                            {filteredSubmissions.map((s) => (
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
                                                    handleStatusChange(s.id, "archived");
                                                }}
                                                disabled={updatingId === s.id || s.status === "archived"}
                                                className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Archive"
                                            >
                                                <span className="material-symbols-outlined text-sm">archive</span>
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
                            <div className="space-y-6">
                                {/* Contact Info */}
                                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                                    <DetailField label="Name" value={selected.name} />
                                    <DetailField label="Email" value={selected.email} />
                                    <DetailField label="Phone" value={selected.phone || '—'} />
                                    <DetailField label="Service" value={selected.service || selected.subject || '—'} />
                                </section>

                                {/* Message Content */}
                                <section>
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Message</p>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
                                        <p className="text-sm text-slate-900 whitespace-pre-wrap wrap-break-word">{selected.message}</p>
                                    </div>
                                </section>

                                {/* Meta Info */}
                                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                                    <DetailField label="Status" value={selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} />
                                    <DetailField label="Date" value={formatDate(selected.createdAt)} />
                                </section>
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
                                        handleStatusChange(selected.id, "archived");
                                        setSelected(null);
                                    }}
                                    disabled={selected.status === "archived"}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    count,
    icon,
    color,
}: {
    label: string;
    count: number;
    icon: string;
    color: string;
}) {
    return (
        <div className="rounded-lg bg-white border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-linear-to-br ${color} flex items-center justify-center text-white shadow-md`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
            </div>
        </div>
    );
}

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
            <p className="text-sm font-medium text-slate-900 wrap-break-word">{value}</p>
        </div>
    );
}
