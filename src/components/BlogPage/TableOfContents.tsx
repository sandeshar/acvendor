"use client";

import { useEffect, useState } from 'react';

interface Header {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ headers }: { headers: Header[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0% 0% -80% 0%' }
        );

        headers.forEach((header) => {
            const element = document.getElementById(header.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headers]);

    if (!headers || headers.length === 0) return null;

    return (
        <nav className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Table of Contents</h3>
            <ul className="space-y-2">
                {headers.map((header) => (
                    <li
                        key={header.id}
                        className={`${header.level === 3 ? 'ml-4' : ''}`}
                    >
                        <a
                            href={`#${header.id}`}
                            className={`text-sm transition-colors hover:text-primary ${activeId === header.id ? 'text-primary font-bold' : 'text-slate-600 font-medium'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(header.id)?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                                // Manual offset for sticky header
                                const yOffset = -100;
                                const element = document.getElementById(header.id);
                                if (element) {
                                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                    window.scrollTo({ top: y, behavior: 'smooth' });
                                }
                            }}
                        >
                            {header.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
