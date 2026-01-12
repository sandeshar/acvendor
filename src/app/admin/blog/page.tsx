"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { showToast } from '@/components/Toast';
import { getBlogStatusLabel, getBlogStatusClasses } from "@/utils/statusHelpers";
import { BlogPost } from "@/types/blog";

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<number | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/blog');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (slug: string, newStatus: number, title: string) => {
        try {
            const response = await fetch('/api/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    status: newStatus === 1 ? 'draft' : newStatus === 2 ? 'published' : 'in-review'
                }),
            });

            if (response.ok) {
                showToast(`Status updated for "${title}"!`, { type: 'success' });
                fetchPosts();
            } else {
                const data = await response.json();
                showToast(data.error || 'Failed to update status', { type: 'error' });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status. Please try again.', { type: 'error' });
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/blog?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showToast('Post deleted successfully!', { type: 'success' });
                fetchPosts(); // Refresh the list
            } else {
                const data = await response.json();
                showToast(data.error || 'Failed to delete post', { type: 'error' });
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Failed to delete post. Please try again.', { type: 'error' });
        }
    };

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            post.title?.toLowerCase().includes(query) ||
            post.slug?.toLowerCase().includes(query) ||
            (post.tags && post.tags.toLowerCase().includes(query))
        );
        const matchesStatus = statusFilter === null || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading posts...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 p-8 overflow-y-auto" >
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
                    <p className="text-slate-500 mt-1">Manage your blog posts here. Add, edit, or remove posts.</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 flex flex-wrap gap-4 items-center border-b border-slate-200">
                        <div className="relative flex-1 min-w-[250px]">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Search posts..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                            value={statusFilter ?? ''}
                            onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">All Status</option>
                            <option value="1">Draft</option>
                            <option value="2">Published</option>
                            <option value="3">In Review</option>
                        </select>
                        <Link href="/admin/blog/add" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white">
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Post
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3" scope="col">Title</th>
                                    <th className="px-6 py-3" scope="col">Author</th>
                                    <th className="px-6 py-3" scope="col">Status</th>
                                    <th className="px-6 py-3" scope="col">Date Published</th>
                                    <th className="px-6 py-3 text-right" scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            {posts.length === 0 ? (
                                                <>
                                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-2 block">article</span>
                                                    <p className="text-lg">No blog posts yet</p>
                                                    <p className="text-sm mt-1">Create your first post to get started</p>
                                                </>
                                            ) : (
                                                <p>No posts found matching "{searchQuery}"</p>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{post.title}</td>
                                            <td className="px-6 py-4 text-slate-700">Admin User</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={post.status}
                                                    onChange={(e) => handleStatusChange(post.slug, Number(e.target.value), post.title)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-primary ${getBlogStatusClasses(post.status)}`}
                                                >
                                                    <option value="1">Draft</option>
                                                    <option value="2">Published</option>
                                                    <option value="3">In Review</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/blog/edit/${post.slug}`}
                                                    className="p-1 text-slate-500 hover:text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary inline-block"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    className="p-1 text-slate-500 hover:text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 flex justify-between items-center text-sm text-slate-500">
                        <span>Showing {filteredPosts.length} of {posts.length} results</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchPosts}
                                className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
