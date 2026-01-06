"use client";

import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { User } from "@/types/user";
import { showToast } from '@/components/Toast';

export default function AddUserPage() {
    const id = useParams().id;
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "admin",
    });
    const [user, setUser] = useState<User | null>(null);
    const getUserData = async () => {
        try {
            const response = await fetch(`/api/users?id=${id}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.role,
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Update user:", formData);
        const response = await fetch(`/api/users`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id as string, ...formData }),
        });
        if (response.ok) {
            showToast('User updated successfully!', { type: 'success' });
            router.push('/admin/users');
        } else {
            const data = await response.json();
            showToast(data.error || 'Failed to update user.', { type: 'error' });
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Edit User</h1>
                        <p className="text-slate-500 mt-1">Update the user account details and permissions.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Leave empty to keep current password</p>
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="super admin">Super Admin</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
