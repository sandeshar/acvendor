'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
    type?: ToastType;
    duration?: number; // ms (minimum 3000)
};

type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
};

let idCounter = 1;

export function showToast(message: string, opts?: ToastOptions) {
    const detail = { message, opts };
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { detail }));
    }
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        function onShow(e: any) {
            const message = e?.detail?.message || '';
            const opts: ToastOptions = e?.detail?.opts || {};
            const type = opts.type || 'info';
            // Enforce default and minimum duration of 3000ms
            const DEFAULT = 3000;
            const requested = typeof opts.duration === 'number' ? opts.duration : DEFAULT;
            const duration = Math.max(requested, DEFAULT);
            const id = idCounter++;
            setToasts((t) => [{ id, message, type }, ...t]);
            setTimeout(() => {
                setToasts((t) => t.filter((x) => x.id !== id));
            }, duration);
        }
        window.addEventListener('show-toast', onShow as EventListener);
        return () => window.removeEventListener('show-toast', onShow as EventListener);
    }, []);

    return (
        <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((t) => (
                <div key={t.id} className={`toast max-w-sm w-full rounded-md border p-3 shadow-sm bg-card border-muted text-body flex items-start gap-3` + (t.type === 'success' ? ' toast-success' : t.type === 'error' ? ' toast-error' : '')}>
                    <div className="shrink-0">
                        {t.type === 'success' ? (
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                        ) : t.type === 'error' ? (
                            <span className="material-symbols-outlined text-primary">error</span>
                        ) : (
                            <span className="material-symbols-outlined text-primary">info</span>
                        )}
                    </div>
                    <div className="flex-1 text-sm leading-tight">{t.message}</div>
                </div>
            ))}
        </div>
    );
}
