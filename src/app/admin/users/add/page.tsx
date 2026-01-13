"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from '@/components/Toast';

export default function AddUserPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        designation: "",
        password: "",
        role: "admin",
        photo: "",
        signature: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Add user:", formData);
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        if (response.ok) {
            showToast('User added successfully!', { type: 'success' });
            router.push('/admin/users');
        } else {
            showToast('Failed to add user.', { type: 'error' });
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Add New User</h1>
                        <p className="text-slate-500 mt-1">Create a new user account with role and permissions.</p>
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
                                    <label htmlFor="designation" className="block text-sm font-medium text-slate-700 mb-2">
                                        Designation / Official Role
                                    </label>
                                    <input
                                        type="text"
                                        id="designation"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="e.g. Sales Manager, CEO"
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
                                        placeholder="Enter password"
                                        required
                                    />
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

                                <div>
                                    <label htmlFor="photo" className="block text-sm font-medium text-slate-700 mb-2">
                                        Profile Photo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            id="photo"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const fd = new FormData();
                                                    fd.append('file', file);
                                                    fd.append('folder', 'users');
                                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const json = await res.json();
                                                    if (res.ok && json.url) {
                                                        setFormData({ ...formData, photo: json.url });
                                                    } else {
                                                        showToast('Upload failed', { type: 'error' });
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        {formData.photo && (
                                            <img src={formData.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="signature" className="block text-sm font-medium text-slate-700 mb-2">
                                        Signature
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            id="signature"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const fd = new FormData();
                                                    fd.append('file', file);
                                                    fd.append('folder', 'users/signatures');
                                                    const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const json = await res.json();
                                                    if (res.ok && json.url) {
                                                        setFormData({ ...formData, signature: json.url });
                                                    } else {
                                                        showToast('Upload failed', { type: 'error' });
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        {formData.signature && (
                                            <img src={formData.signature} alt="Signature Preview" className="h-12 w-auto object-contain border border-slate-200" />
                                        )}
                                    </div>
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
                                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white"
                                >
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
