"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface ProductGalleryProps {
    images: string[];
    inventory_status?: string | null;
}

export default function ProductGallery({ images = [], inventory_status }: ProductGalleryProps) {
    const [active, setActive] = useState(0);
    const primary = images && images.length ? images[active] : '/placeholder-product.png';

    return (
        <div className="flex flex-col gap-4">
            <div className="w-full aspect-4/3 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-8 relative overflow-hidden group">
                <div
                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                    data-alt="product image"
                    style={{ backgroundImage: `url("${primary}")` }}
                />

                {inventory_status === 'in_stock' && (
                    <div className="absolute top-4 left-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</div>
                )}

                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`min-w-24 h-24 rounded-lg p-2 cursor-pointer ${i === active ? 'border-2 border-primary' : 'border border-gray-200 bg-white'}`}>
                        <div className="w-full h-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${img}")` }} />
                    </button>
                ))}
            </div>
        </div>
    );
}
