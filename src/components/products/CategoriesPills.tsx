"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesPills({ brand, selectedCategory = '', selectedSubcategory = '' }: { brand?: string, selectedCategory?: string, selectedSubcategory?: string }) {
    const [categories, setCategories] = useState<any[]>([]);
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
        <div className="flex gap-2 w-max py-1">
            <Link href="/midea-ac" className={`flex h-8 md:h-9 items-center justify-center gap-x-2 rounded-full ${!selectedCategory ? 'bg-[#111418] text-white' : 'bg-white border border-gray-200'} px-3 md:px-4 text-xs md:text-sm transition-all`}>All</Link>
            {categories.map((c, cIdx) => {
                const catKey = c._id ?? c.id ?? c.slug ?? cIdx;
                const catIdStr = String(c._id ?? c.id ?? '');
                return (
                    <div key={catKey} className="flex items-center gap-2">
                        <Link href={`/midea-ac?category=${encodeURIComponent(c.slug)}`} className={`flex h-8 md:h-9 items-center justify-center gap-x-1 md:gap-x-2 rounded-full ${selectedCategory === c.slug ? 'bg-[#111418] text-white' : 'bg-white border border-gray-200'} px-3 md:px-4 text-xs md:text-sm whitespace-nowrap transition-all`}>{c.name}</Link>
                        {subcats.filter(sc => String(sc.category_id) === catIdStr).slice(0, 3).map((sc: any, scIdx: number) => (
                            <Link key={sc._id ?? sc.id ?? sc.slug ?? scIdx} href={`/midea-ac?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}`} className={`px-2 py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap ${selectedSubcategory === sc.slug ? 'bg-primary/10 text-primary font-medium border-primary/20' : 'bg-white text-[#617589] border border-gray-100'} border transition-all shadow-xs`}>
                                {sc.name}
                            </Link>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
