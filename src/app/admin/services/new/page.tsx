"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import { showToast } from "@/components/Toast";

export default function NewServicePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [catsRes, subsRes] = await Promise.all([
                    fetch('/api/pages/services/categories'),
                    fetch('/api/pages/services/subcategories')
                ]);
                if (catsRes.ok) setCategories(await catsRes.json());
                if (subsRes.ok) setSubcategories(await subsRes.json());
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async (serviceData: any) => {
        setSaving(true);
        try {
            const finalSlug = serviceData.slug.trim();

            const postPayload = {
                title: serviceData.title,
                slug: finalSlug,
                excerpt: serviceData.excerpt || serviceData.description,
                content: serviceData.content || `<p>${serviceData.description}</p>`,
                thumbnail: serviceData.thumbnail || serviceData.image || null,
                icon: serviceData.icon,
                metaTitle: serviceData.metaTitle || serviceData.title,
                metaDescription: serviceData.metaDescription || serviceData.description,
                category_id: serviceData.category_id || null,
                subcategory_id: serviceData.subcategory_id || null,
                price: serviceData.price || null,
                price_type: serviceData.price_type || 'fixed',
                price_label: serviceData.price_label || null,
                price_description: serviceData.price_description || null,
            }; 

            const postResponse = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload),
            });

            if (!postResponse.ok) {
                const errorData = await postResponse.json();
                throw new Error(errorData.error || 'Failed to save service post');
            }
            const postData = await postResponse.json();

            const detailPayload: any = {
                key: finalSlug,
                slug: finalSlug,
                icon: serviceData.icon || 'design_services',
                title: serviceData.title || 'New Service',
                description: serviceData.description || serviceData.excerpt || 'Service description',
                bullets: JSON.stringify(serviceData.bullets || []),
                image: serviceData.image || serviceData.thumbnail || '/placeholder-service.jpg',
                image_alt: serviceData.image_alt || serviceData.title || 'Service image',
                display_order: serviceData.display_order ?? 0,
                is_active: 1,
                postId: postData.id,
            };

            const detailResponse = await fetch('/api/pages/services/details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailResponse.ok) {
                const errorData = await detailResponse.json();
                throw new Error(`Failed to save service detail: ${errorData.error || 'Unknown error'}`);
            }

            showToast('Service created successfully!', { type: 'success' });
            router.push('/admin/services/manager');
        } catch (error: any) {
            console.error('Error saving service:', error);
            showToast(error.message || 'Failed to save service. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <ServiceForm 
                categories={categories}
                subcategories={subcategories}
                onSave={handleSave}
                saving={saving}
                isNew={true}
            />
        </div>
    );
}
