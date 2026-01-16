"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
    id: any;
    _id?: any;
    name: string;
    slug: string;
    icon?: string;
}

export default function CategoriesList({ brand, selectedCategory = '', selectedSubcategory = '' }: { brand?: string, selectedCategory?: string, selectedSubcategory?: string }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcats, setSubcats] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                let finalBrand = brand;
                if (!finalBrand) {
                    const s = await fetch('/api/store-settings');
                    const js = s.ok ? await s.json() : null;
                    finalBrand = js?.data?.featuredBrand || '';
                }
                const qs = finalBrand ? `?category=${encodeURIComponent(finalBrand)}` : '';
                const catsRes = await fetch(`/api/pages/services/categories${qs}`);
                let cats = catsRes.ok ? await catsRes.json() : [];
                // If brand is provided, show only brand-specific categories (exclude global categories)
                if (finalBrand) cats = (cats || []).filter((c: any) => String(c.brand || '').toLowerCase() === String(finalBrand).toLowerCase());
                if (mounted) setCategories(cats || []);

                const subsRes = await fetch(`/api/pages/services/subcategories${qs}`);
                const subs = subsRes.ok ? await subsRes.json() : [];
                if (mounted) setSubcats(subs || []);
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [brand]);

    return (
        <div className="flex flex-col gap-2">
            <Link
                href={brand ? `/midea-ac?category=${encodeURIComponent(brand)}` : '/midea-ac'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'} text-sm font-bold`}
            >
                <span className="material-symbols-outlined">ac_unit</span>
                <p>{brand ? `${brand.toUpperCase()} All` : 'All Midea'}</p>
            </Link>

            {categories.map((c, cIdx) => {
                const isActive = selectedCategory === c.slug;
                const filteredSubs = subcats.filter(sc => sc.category_id === (c.id || c._id));

                return (
                    <div key={c.id || c.slug || cIdx} className="space-y-1">
                        <Link
                            href={`/midea-ac?category=${encodeURIComponent(c.slug)}`}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'} text-sm font-bold`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-lg">{c.icon || 'inventory_2'}</span>
                                <p>{c.name}</p>
                            </div>
                            <span className={`material-symbols-outlined text-sm transition-transform ${isActive ? 'rotate-90' : ''}`}>chevron_right</span>
                        </Link>

                        {isActive && filteredSubs.length > 0 ? (
                            <div className="pl-4 mt-2 space-y-1 border-l-2 border-gray-100 ml-4 animate-in slide-in-from-top-2 duration-300">
                                <Link
                                    href={`/midea-ac?category=${encodeURIComponent(c.slug)}`}
                                    className={`block px-4 py-2 rounded-lg text-xs font-bold transition-all ${!selectedSubcategory ? 'text-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    All {c.name}
                                </Link>
                                {filteredSubs.map((sc: any, scIdx: number) => (
                                    <Link
                                        key={sc._id || sc.id || sc.slug || scIdx}
                                        href={`/midea-ac?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}`}
                                        className={`flex items-center justify-between px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedSubcategory === sc.slug ? 'text-primary bg-primary/5' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {sc.name}
                                        {selectedSubcategory === sc.slug && <span className="material-symbols-outlined text-xs">check</span>}
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
