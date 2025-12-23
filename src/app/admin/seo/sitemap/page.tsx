"use client";

import { useEffect, useState } from "react";
import { showToast } from '@/components/Toast';

export default function SitemapPage() {
    const [generating, setGenerating] = useState(false);
    const [lastGenerated, setLastGenerated] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalUrls: 0, pages: 0, blogPosts: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/seo/sitemap/stats');
                const json = await res.json();
                if (json?.success) {
                    setStats(json.stats || { totalUrls: 0, pages: 0, blogPosts: 0 });
                    setLastGenerated(json.lastGenerated || null);
                }
            } catch (e) {
                console.error('Failed to load sitemap stats', e);
            }
        };
        load();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/seo/sitemap/generate', {
                method: 'POST',
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to generate');
            }
            setStats(json.stats);
            setLastGenerated(new Date().toISOString());
            showToast('Stats refreshed successfully', { type: 'success' });
        } catch (e: any) {
            console.error('Generate failed', e);
            showToast(e.message || 'Failed to generate', { type: 'error' });
        } finally {
            setGenerating(false);
        }
    };

    // Prefer a server-configured BASE URL so SSR and client output match.
    const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const [baseUrl, setBaseUrl] = useState<string>(defaultBaseUrl);

    useEffect(() => {
        if (!defaultBaseUrl && typeof window !== 'undefined') setBaseUrl(window.location.origin);
    }, []);

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Sitemap Manager</h1>
                        <p className="text-slate-500 mt-1">Generate and manage your XML sitemap for search engines.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Stats Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Sitemap Statistics</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600">{stats.totalUrls}</div>
                                    <div className="text-sm text-slate-600">Total URLs</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">{stats.pages}</div>
                                    <div className="text-sm text-slate-600">Static Pages</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-purple-600">{stats.blogPosts}</div>
                                    <div className="text-sm text-slate-600">Blog Posts</div>
                                </div>
                            </div>
                            {lastGenerated && (
                                <div className="mt-4 text-sm text-slate-500">
                                    Last generated: {new Date(lastGenerated).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="w-full bg-primary text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    {generating ? 'Refreshing...' : 'Refresh Stats'}
                                </button>
                                <a
                                    href="/sitemap.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-slate-100"
                                >
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                    View Sitemap
                                </a>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-2">About Sitemaps</h3>
                                    <p className="text-sm text-blue-800">
                                        XML sitemaps help search engines discover and index your content. Your sitemap is automatically
                                        generated by Next.js from your pages and published blog posts in real-time. Submit your sitemap URL
                                        to Google Search Console and other search engines for better indexing.
                                    </p>
                                    <p className="text-sm text-blue-800 mt-2">
                                        <strong>Sitemap URL:</strong> <code className="bg-white px-2 py-1 rounded">{baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml'}</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
