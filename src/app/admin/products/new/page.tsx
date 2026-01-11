"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { showToast } from "@/components/Toast";

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const handleSave = async (product: any) => {
        if (!product.title || !product.slug) {
            showToast('Title and slug are required', { type: 'error' });
            return;
        }

        setSaving(true);
        try {
            // 1. Create Product
            const imagesPayload = (product.images || []).map((url: string, idx: number) => ({
                url, alt: product.title, is_primary: idx === 0 ? 1 : 0, display_order: idx
            }));

            const postPayload = {
                ...product,
                images: imagesPayload,
                thumbnail: product.thumbnail || null,
                metaTitle: product.meta_title || product.title,
                metaDescription: product.meta_description || product.excerpt,
                // include rich content so frontend shows tables and other markup
                content: product.content || null,
                excerpt: product.excerpt || null,
                // technical fields flatten for DB
                power: product.technical?.power || null,
                iseer: product.technical?.iseer || null,
                refrigerant: product.technical?.refrigerant || null,
                noise: product.technical?.noise || null,
                dimensions: product.technical?.dimensions || null,
                voltage: product.technical?.voltage || null,
                capacity: product.technical?.capacity || null,
                warranty: product.technical?.warranty || null,
                // persist custom specs and features where provided
                customSpecs: product.technical?.customSpecs || null,
                custom_specs: product.technical?.customSpecs ? JSON.stringify(product.technical?.customSpecs || []) : null,
                features: product.features || null,
                locations: JSON.stringify(product.locations || []),
            };

            const postRes = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload),
            });

            if (!postRes.ok) {
                const err = await postRes.json();
                throw new Error(err.error || 'Failed to create product');
            }
            const postData = await postRes.json();

            // NOTE: Creating a service detail for products has been removed to keep products and services independent.

            showToast('Product created successfully', { type: 'success' });
            router.push(`/admin/products/${postData.id}`);
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Failed to create product', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProductForm
            title="Add New Product"
            saving={saving}
            onSave={handleSave}
        />
    );
}
