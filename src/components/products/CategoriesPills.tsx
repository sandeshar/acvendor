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
        <div className="flex gap-3 w-max">
            <Link href="/midea-ac" className={`flex h-9 items-center justify-center gap-x-2 rounded-full ${!selectedCategory ? 'bg-[#111418] text-white' : 'bg-white border border-gray-200'} px-4`}>All</Link>
            {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                    <Link href={`/midea-ac?category=${encodeURIComponent(c.slug)}`} className={`flex h-9 items-center justify-center gap-x-2 rounded-full ${selectedCategory === c.slug ? 'bg-[#111418] text-white' : 'bg-white border border-gray-200'} px-4`}>{c.name}</Link>
                    {subcats.filter(sc => sc.category_id === c.id).slice(0, 3).map((sc: any) => (
                        <Link key={sc.id} href={`/midea-ac?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}`} className={`px-2 py-1 rounded-full text-sm ${selectedSubcategory === sc.slug ? 'bg-primary/10 text-primary font-medium' : 'bg-white text-[#617589] border border-gray-100'}`}>
                            {sc.name}
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    );
}
