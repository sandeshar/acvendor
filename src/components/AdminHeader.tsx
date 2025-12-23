'use client'
import { useState, useEffect } from 'react';

const AdminHeader = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            document.body.classList.add('admin-sidebar-open');
        } else {
            document.body.classList.remove('admin-sidebar-open');
        }
        return () => document.body.classList.remove('admin-sidebar-open');
    }, [open]);

    return (
        <>
            <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
                <button
                    onClick={() => setOpen((s) => !s)}
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="Toggle admin sidebar"
                >
                    <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
                </button>

                <div className="text-base font-semibold">Admin</div>

                <div className="w-8" />
            </header>

            {/* Overlay when sidebar is open on mobile */}
            {open && <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />}
        </>
    );
};

export default AdminHeader;
