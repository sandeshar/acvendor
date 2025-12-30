"use client";

import useCompare from './useCompare';

export default function CompareAddButton({ product }: { product: any }) {
    const { addItem, removeItem, contains } = useCompare();
    const id = product?.id;
    const selected = id ? contains(id) : false;
    const onClick = (e: any) => {
        e.preventDefault();
        if (!id) return;
        if (selected) removeItem(id);
        else addItem({ id, slug: product.slug, title: product.title, thumbnail: product.thumbnail, price: product.price });
    };

    return (
        <button onClick={onClick} aria-pressed={selected} aria-label={selected ? 'Remove from compare' : 'Add to compare'} className={`w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary flex items-center justify-center transition-colors shadow-sm relative z-10`}>
            <span className="material-symbols-outlined text-lg">{selected ? 'check' : 'add'}</span>
        </button>
    );
}
