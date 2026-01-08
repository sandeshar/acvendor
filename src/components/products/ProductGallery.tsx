"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type ImageItem = { src: string; alt?: string };

interface ProductGalleryProps {
    images?: Array<string | ImageItem>;
    inventory_status?: string | null;
    showFavorite?: boolean;
    initialFavorited?: boolean;
    onFavorite?: (favorited: boolean) => void;
    onSelect?: (index: number) => void;
}

export default function ProductGallery({ images = [], inventory_status, showFavorite = true, initialFavorited = false, onFavorite, onSelect }: ProductGalleryProps) {
    const [active, setActive] = useState(0);
    const [favorited, setFavorited] = useState(initialFavorited);
    const len = images.length;
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const normalize = (img: string | ImageItem): ImageItem => (typeof img === 'string' ? { src: img } : img);

    useEffect(() => {
        if (active >= len && len > 0) setActive(0);
    }, [len, active]);

    const setActiveSafe = (i: number) => {
        const next = (i + len) % Math.max(len, 1);
        setActive(next);
        onSelect?.(next);
    };

    const prev = () => setActiveSafe(active - 1);
    const next = () => setActiveSafe(active + 1);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    };

    const primary = len ? normalize(images[active]) : { src: '/placeholder-product.png', alt: 'Placeholder product image' };

    const toggleFavorite = () => {
        const next = !favorited;
        setFavorited(next);
        onFavorite?.(next);
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                ref={wrapperRef}
                tabIndex={0}
                onKeyDown={handleKey}
                className="w-full aspect-4/3 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-4 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-roledescription="product image gallery"
                aria-label="Product images"
            >
                <img
                    src={primary.src}
                    alt={primary.alt ?? `Product image ${active + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    draggable={false}
                />

                {inventory_status === 'in_stock' && (
                    <div className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</div>
                )}

                {showFavorite && (
                    <button
                        aria-pressed={favorited}
                        onClick={toggleFavorite}
                        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                        className={`absolute top-3 right-3 p-2 rounded-full bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 ${favorited ? 'text-red-500' : ''}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21.8l8.8-9.4a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                        <span className="sr-only">{favorited ? 'Remove from favorites' : 'Add to favorites'}</span>
                    </button>
                )}

                {len > 1 && (
                    <>
                        <button aria-label="Previous image" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-sm text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 hidden group-hover:block">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18L9 12l6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>

                        <button aria-label="Next image" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-sm text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 hidden group-hover:block">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6l6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </>
                )}

                <div className="sr-only" aria-live="polite">Image {active + 1} of {Math.max(len, 1)}</div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur rounded-full text-xs px-3 py-1 font-medium">{active + 1}/{Math.max(len, 1)}</div>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar" role="list">
                {images.map((img, i) => {
                    const it = normalize(img);
                    return (
                        <button
                            key={i}
                            onClick={() => setActiveSafe(i)}
                            className={`min-w-24 h-24 rounded-lg p-2 cursor-pointer ${i === active ? 'border-2 border-primary' : 'border border-gray-200 bg-white'}`}
                            aria-label={`Select image ${i + 1}`}
                            role="listitem"
                            aria-pressed={i === active}
                        >
                            <img src={it.src} alt={it.alt ?? `Thumbnail ${i + 1}`} className="w-full h-full object-contain" loading="lazy" draggable={false} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
