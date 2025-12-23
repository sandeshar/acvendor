'use client'
import { useEffect, useState } from "react";
import { getStatusLabel, getStatusClasses } from "@/utils/statusHelpers";
import { User } from "@/types/user";
export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
                        <p className="text-slate-500 mt-1">Manage your users here. This page will display user listings, roles, and permissions.</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 flex justify-between items-center border-b border-slate-200">
                            <div className="relative w-full max-w-sm">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Search users..." type="text" onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <a href="/admin/users/add" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white">
                                <span className="material-symbols-outlined text-lg">add</span>
                                Add User
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3" scope="col">User</th>
                                        <th className="px-6 py-3" scope="col">Role</th>
                                        <th className="px-6 py-3 text-right" scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                                        const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || String(user.id))}`;
                                        const handleDelete = async () => {
                                            if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                                await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
                                                fetchUsers();
                                            }
                                        };
                                        return (
                                            <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <img alt={`${user.name} profile picture`} className="w-10 h-10 rounded-full" src={avatarUrl} />
                                                        <div>
                                                            <div>{user.name}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{user.role}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <a href={`/admin/users/edit/${user.id}`} className="p-1 text-slate-500 hover:text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </a>
                                                    <button onClick={handleDelete} className="p-1 text-slate-500 hover:text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No users found matching "{searchTerm}"</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 flex justify-between items-center text-sm text-slate-500">
                            <span>Showing 1 to 4 of 20 results</span>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100">Previous</button>
                                <button className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
