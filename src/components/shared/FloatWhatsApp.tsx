"use client";

import React, { useEffect, useState } from 'react';

export default function FloatWhatsApp() {
    const [href, setHref] = useState<string | null>(null);
    const [visible, setVisible] = useState<boolean>(true);

    useEffect(() => {
        try {
            // Hide on admin pages
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                setVisible(false);
                return;
            }
        } catch (e) { /* ignore */ }

        (async () => {
            try {
                const res = await fetch('/api/pages/contact/info');
                if (!res.ok) return;
                const data = await res.json();
                const link = (data?.whatsapp_number ? `https://wa.me/${String(data.whatsapp_number).replace(/[^0-9]/g, '')}` : null);
                if (link) setHref(link);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    if (!visible || !href) return null;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M20.52 3.48A11.8 11.8 0 0 0 12 .75a11.8 11.8 0 0 0-8.52 2.73A11.8 11.8 0 0 0 .75 12c0 2.07.54 4.09 1.57 5.98L.75 23.25l4.66-1.22A11.75 11.75 0 0 0 12 23.25c2 0 3.95-.52 5.7-1.5a11.8 11.8 0 0 0 2.8-2.76A11.8 11.8 0 0 0 23.25 12c0-3.17-1.27-6.14-3.33-8.52z" fill="white" />
                <path d="M17.02 14.87c-.27-.14-1.61-.79-1.86-.88-.25-.1-.43-.14-.62.14-.18.27-.69.88-.85 1.06-.16.18-.32.2-.59.07-0.27-.13-1.14-.42-2.17-1.35-.8-.71-1.34-1.59-1.49-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.13-.62-1.49-.85-2.03-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.47.07-.72.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.68 1.12 2.86.14.18 1.93 3.1 4.68 4.35 0 0 .43.18.78.09.35-.09 1.61-.66 1.84-1.28.23-.62.23-1.15.16-1.28-.07-.13-.25-.18-.52-.33z" fill="white" />
            </svg>
            <span className="hidden sm:inline font-semibold">Contact</span>
        </a>
    );
}
