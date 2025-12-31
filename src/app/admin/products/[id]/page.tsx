"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { showToast } from "@/components/Toast";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (!productId) return;
        fetchProductData();
    }, [productId]);

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?id=${productId}`);
            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();

            // Load matching service detail by slug
            let detailData = {};
            if (data.slug) {
                const dres = await fetch(`/api/pages/services/details?slug=${data.slug}`);
                if (dres.ok) {
                    const detail = await dres.json();
                    if (!detail.error) {
                        detailData = {
                            application_areas: detail.application_areas ? JSON.parse(detail.application_areas) : [],
                            features: detail.features ? JSON.parse(detail.features) : [],
                            technical: detail.technical ? JSON.parse(detail.technical) : (data.technical || {}),
                        };
                    }
                }
            }

            setInitialData({
                ...data,
                ...detailData,
                locations: data.locations ? (typeof data.locations === 'string' ? JSON.parse(data.locations) : data.locations) : [],
                images: data.images ? data.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
            });
        } catch (e) {
            console.error(e);
            showToast('Failed to load product', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (product: any) => {
        setSaving(true);
        try {
            // 1. Update Product
            const imagesPayload = (product.images || []).map((url: string, idx: number) => ({
                url, alt: product.title, is_primary: idx === 0 ? 1 : 0, display_order: idx
            }));

            const putPayload = {
                ...product,
                id: Number(productId),
                images: imagesPayload,
                metaTitle: product.meta_title || product.title,
                metaDescription: product.meta_description || product.excerpt,
                power: product.technical?.power || null,
                iseer: product.technical?.iseer || null,
                refrigerant: product.technical?.refrigerant || null,
                noise: product.technical?.noise || null,
                dimensions: product.technical?.dimensions || null,
                voltage: product.technical?.voltage || null,
                locations: JSON.stringify(product.locations || []),
            };

            const putRes = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(putPayload),
            });

            if (!putRes.ok) throw new Error('Failed to update product');

            // 2. Upsert Service Detail
            // First find the detail record id
            const dSearch = await fetch(`/api/pages/services/details?slug=${product.slug}`);
            const detailSearch = await dSearch.json();
            const detailId = detailSearch?.id;

            const detailPayload: any = {
                key: product.slug,
                slug: product.slug,
                title: product.title,
                description: product.excerpt,
                image: product.thumbnail || '/placeholder-product.png',
                postId: Number(productId),
                locations: JSON.stringify(product.locations || []),
                inventory_status: product.inventory_status,
                images: JSON.stringify(product.images || []),
                application_areas: JSON.stringify(product.application_areas || []),
                features: JSON.stringify(product.features || []),
                technical: JSON.stringify(product.technical || {}),
            };

            if (detailId) {
                detailPayload.id = detailId;
                await fetch('/api/pages/services/details', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailPayload),
                });
            } else {
                await fetch('/api/pages/services/details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailPayload),
                });
            }

            showToast('Product updated successfully', { type: 'success' });
            fetchProductData();
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Update failed', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Synchronizing product data...</p>
            </div>
        );
    }

    return (
        <ProductForm
            title="Edit Product"
            initialData={initialData}
            saving={saving}
            onSave={handleSave}
        />
    );
}
