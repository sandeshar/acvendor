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
                // technical fields flatten for DB
                power: product.technical?.power || null,
                iseer: product.technical?.iseer || null,
                refrigerant: product.technical?.refrigerant || null,
                noise: product.technical?.noise || null,
                dimensions: product.technical?.dimensions || null,
                voltage: product.technical?.voltage || null,
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

            // 2. Create Service Detail
            const detailPayload = {
                key: product.slug,
                slug: product.slug,
                icon: 'inventory_2',
                title: product.title,
                description: product.excerpt,
                image: product.thumbnail || '/placeholder-product.png',
                image_alt: product.title,
                postId: postData.id,
                locations: JSON.stringify(product.locations || []),
                inventory_status: product.inventory_status,
                images: JSON.stringify(product.images || []),
                application_areas: JSON.stringify(product.application_areas || []),
                features: JSON.stringify(product.features || []),
                technical: JSON.stringify(product.technical || {}),
            };

            const detailRes = await fetch('/api/pages/services/details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailRes.ok) {
                throw new Error('Product created but failed to create detail record');
            }

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
