"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
    id: number;
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
                const qs = finalBrand ? `?brand=${encodeURIComponent(finalBrand)}` : '';
                const catsRes = await fetch(`/api/pages/services/categories${qs}`);
                const cats = catsRes.ok ? await catsRes.json() : [];
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
        <div className="flex flex-col gap-1">
            <Link href={brand ? `/midea-ac?brand=${encodeURIComponent(brand)}` : '/midea-ac'} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${!selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-[#f0f2f4]'} transition-colors`}>
                <span className="material-symbols-outlined">ac_unit</span>
                <p className="text-sm font-bold leading-normal">{brand ? `${brand.toUpperCase()} All` : 'All Midea'}</p>
            </Link>
            {categories.map((c, cIdx) => (
                <div key={c.id ?? c.id ?? c.slug ?? cIdx}>
                    <Link href={`/midea-ac?category=${encodeURIComponent(c.slug)}`} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${selectedCategory === c.slug ? 'bg-primary/10 text-primary' : 'hover:bg-[#f0f2f4]'} transition-colors`}>
                        <span className="material-symbols-outlined text-[#617589]">{c.icon || 'inventory_2'}</span>
                        <p className="text-[#111418] text-sm font-medium leading-normal">{c.name}</p>
                    </Link>
                    {/* subcategories */}
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                        {subcats.filter(sc => sc.category_id === c.id).map((sc: any, scIdx: number) => (
                            <Link key={sc._id ?? sc.id ?? sc.slug ?? scIdx} href={`/midea-ac?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}`} className={`px-3 py-1 rounded-lg text-sm ${selectedSubcategory === sc.slug ? 'bg-primary/10 text-primary font-medium' : 'text-[#617589] hover:bg-[#f0f2f4]'}`}>
                                {sc.name}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
