"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

export default function CategoriesList({ selectedCategory = '', selectedSubcategory = '' }: { selectedCategory?: string, selectedSubcategory?: string }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcats, setSubcats] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        fetch('/api/pages/services/categories')
            .then(r => r.ok ? r.json() : [])
            .then((data) => { if (mounted) setCategories(data || []); })
            .catch(() => {});
        fetch('/api/pages/services/subcategories')
            .then(r => r.ok ? r.json() : [])
            .then((data) => { if (mounted) setSubcats(data || []); })
            .catch(() => {});
        return () => { mounted = false; };
    }, []);

    return (
        <div className="flex flex-col gap-1">
            <Link href="/products" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${!selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-[#f0f2f4]'} transition-colors`}>
                <span className="material-symbols-outlined">ac_unit</span>
                <p className="text-sm font-bold leading-normal">All Products</p>
            </Link>
            {categories.map((c) => (
                <div key={c.id}>
                    <Link href={`/products?category=${encodeURIComponent(c.slug)}`} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${selectedCategory === c.slug ? 'bg-primary/10 text-primary' : 'hover:bg-[#f0f2f4]'} transition-colors`}>
                        <span className="material-symbols-outlined text-[#617589]">{c.icon || 'inventory_2'}</span>
                        <p className="text-[#111418] text-sm font-medium leading-normal">{c.name}</p>
                    </Link>
                    {/* subcategories */}
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                        {subcats.filter(sc => sc.category_id === c.id).map((sc: any) => (
                            <Link key={sc.id} href={`/products?category=${encodeURIComponent(c.slug)}&subcategory=${encodeURIComponent(sc.slug)}`} className={`px-3 py-1 rounded-lg text-sm ${selectedSubcategory === sc.slug ? 'bg-primary/10 text-primary font-medium' : 'text-[#617589] hover:bg-[#f0f2f4]'}`}>
                                {sc.name}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
