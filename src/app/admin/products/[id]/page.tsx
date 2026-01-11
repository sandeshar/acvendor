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

            // NOTE: We no longer load or merge service detail records into product editor; products are kept independent.

            const applicationAreas = (() => {
                if (!data.application_areas) return [];
                if (typeof data.application_areas === 'string') {
                    try { return JSON.parse(data.application_areas); } catch (e) { return [data.application_areas].filter(Boolean); }
                }
                return data.application_areas;
            })();

            // parse custom specs into technical.customSpecs and map top-level technical fields into `technical` object
            const parsedCustomSpecs = (() => {
                if (!data.custom_specs && !data.customSpecs) return [];
                const v = data.customSpecs || data.custom_specs;
                if (!v) return [];
                if (typeof v === 'string') {
                    try { return JSON.parse(v); } catch (e) { return []; }
                }
                return v;
            })();

            const parsedFeatures = (() => {
                if (!data.features) return [];
                if (typeof data.features === 'string') {
                    try { return JSON.parse(data.features); } catch (e) { return []; }
                }
                return data.features || [];
            })();

            setInitialData({
                ...data,
                locations: data.locations ? (typeof data.locations === 'string' ? JSON.parse(data.locations) : data.locations) : [],
                images: data.images ? data.images.map((img: any) => typeof img === 'string' ? img : img.url) : [],
                application_areas: applicationAreas,
                features: parsedFeatures || [],
                technical: {
                    power: data.power || '',
                    iseer: data.iseer || '',
                    refrigerant: data.refrigerant || '',
                    noise: data.noise || '',
                    dimensions: data.dimensions || '',
                    voltage: data.voltage || '',
                    capacity: data.capacity || '',
                    warranty: data.warranty || '',
                    customSpecs: parsedCustomSpecs || [],
                }
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
                id: productId,
                images: imagesPayload,
                metaTitle: product.meta_title || product.title,
                metaDescription: product.meta_description || product.excerpt,
                // include rich content so frontend shows tables and other markup
                content: product.content || null,
                excerpt: product.excerpt || null,
                power: product.technical?.power || null,
                iseer: product.technical?.iseer || null,
                refrigerant: product.technical?.refrigerant || null,
                noise: product.technical?.noise || null,
                dimensions: product.technical?.dimensions || null,
                voltage: product.technical?.voltage || null,
                capacity: product.technical?.capacity || null,
                warranty: product.technical?.warranty || null,
                // persist custom specs
                customSpecs: product.technical?.customSpecs || null,
                custom_specs: product.technical?.customSpecs ? JSON.stringify(product.technical?.customSpecs || []) : null,
                features: product.features || null,
                locations: JSON.stringify(product.locations || []),
            };

            const putRes = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(putPayload),
            });

            if (!putRes.ok) throw new Error('Failed to update product');

            // NOTE: Upserting service detail records when saving products has been removed so products do not automatically create/modify service pages.

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
