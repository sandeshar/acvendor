'use client'
import { useState, useEffect } from 'react';

const AdminHeader = () => {
    const [open, setOpen] = useState(false);
    const [siteName, setSiteName] = useState('Admin');

    useEffect(() => {
        if (open) {
            document.body.classList.add('admin-sidebar-open');
        } else {
            document.body.classList.remove('admin-sidebar-open');
        }
        return () => document.body.classList.remove('admin-sidebar-open');
    }, [open]);

    useEffect(() => {
        const fetchSiteName = async () => {
            try {
                const response = await fetch('/api/store-settings', { cache: 'no-store' });
                if (response.ok) {
                    const payload = await response.json();
                    const s = payload?.data || payload;
                    const name = s?.storeName || s?.store_name || '';
                    if (name) setSiteName(name);
                }
            } catch (error) {
                console.error('Failed to fetch site name:', error);
            }
        };
        fetchSiteName();
    }, []);

    return (
        <>
            <header className="md:hidden sticky top-0 z-50 bg-[#0c111d] border-b border-slate-800 flex items-center justify-between px-4 py-3 shadow-md">
                <button
                    onClick={() => setOpen((s) => !s)}
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white transition-colors"
                    aria-label="Toggle admin sidebar"
                >
                    <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-white text-sm font-bold leading-none">{siteName}</span>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold mt-1 tracking-wider">Admin Panel</span>
                </div>

                <div className="w-10 flex justify-end">
                    <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {siteName.charAt(0)}
                    </div>
                </div>
            </header>

            {/* Overlay when sidebar is open on mobile */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
};

export default AdminHeader;
