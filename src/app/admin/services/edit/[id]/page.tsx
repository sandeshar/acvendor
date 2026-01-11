"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import { showToast } from "@/components/Toast";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [service, setService] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [catsRes, subsRes, servicesRes] = await Promise.all([
                    fetch('/api/pages/services/categories'),
                    fetch('/api/pages/services/subcategories'),
                    fetch('/api/pages/services/details?all=true')
                ]);
                
                if (catsRes.ok) setCategories(await catsRes.json());
                if (subsRes.ok) setSubcategories(await subsRes.json());
                
                if (servicesRes.ok) {
                    const allServices = await servicesRes.json();
                    const currentService = allServices.find((s: any) => 
                        String(s.id) === id || s.slug === id || s.key === id
                    );
                    
                    if (currentService) {
                        // Fetch the post data too for full content
                        const postsRes = await fetch('/api/services');
                        if (postsRes.ok) {
                            const allPosts = await postsRes.json();
                            const post = allPosts.find((p: any) => 
                                (currentService.postId && p.id === currentService.postId) || 
                                p.slug === (currentService.slug || currentService.key)
                            );
                            
                            if (post) {
                                setService({
                                    ...currentService,
                                    ...post,
                                    bullets: typeof currentService.bullets === 'string' 
                                        ? JSON.parse(currentService.bullets) 
                                        : (currentService.bullets || []),
                                    id: currentService.id, // Ensure original detail ID is kept
                                    postId: post.id
                                });
                            } else {
                                setService({
                                    ...currentService,
                                    bullets: typeof currentService.bullets === 'string' 
                                        ? JSON.parse(currentService.bullets) 
                                        : (currentService.bullets || [])
                                });
                            }
                        }
                    } else {
                        // If no detail found, check if it exists in posts (for services that were only blog posts)
                        const postsRes = await fetch('/api/services');
                        if (postsRes.ok) {
                            const allPosts = await postsRes.json();
                            const post = allPosts.find((p: any) => String(p.id) === id || p.slug === id);
                            if (post) {
                                setService({
                                    ...post,
                                    isNewDetail: true, // Marker to indicate no detail record exists yet
                                    postId: post.id,
                                    bullets: []
                                });
                            } else {
                                showToast("Service not found", { type: 'error' });
                                router.push('/admin/services/manager');
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                showToast("Failed to load service data", { type: 'error' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, router]);

    const handleSave = async (serviceData: any) => {
        setSaving(true);
        try {
            const finalSlug = serviceData.slug.trim();

            const postPayload = {
                id: serviceData.postId,
                title: serviceData.title,
                slug: finalSlug,
                excerpt: serviceData.excerpt || serviceData.description,
                content: serviceData.content || `<p>${serviceData.description}</p>`,
                thumbnail: serviceData.thumbnail || serviceData.image || null,
                icon: serviceData.icon,
                statusId: serviceData.statusId || 1,
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
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postPayload),
            });

            if (!postResponse.ok) {
                const errorData = await postResponse.json();
                throw new Error(errorData.error || 'Failed to update service post');
            }

            const detailPayload: any = {
                id: serviceData.id,
                key: finalSlug,
                slug: finalSlug,
                icon: serviceData.icon || 'design_services',
                title: serviceData.title || 'Service Title',
                description: serviceData.description || serviceData.excerpt || 'Service description',
                bullets: JSON.stringify(serviceData.bullets || []),
                image: serviceData.image || serviceData.thumbnail || '/placeholder-service.jpg',
                image_alt: serviceData.image_alt || serviceData.title || 'Service image',
                display_order: serviceData.display_order ?? 0,
                is_active: 1,
                postId: serviceData.postId,
            };

            const detailResponse = await fetch('/api/pages/services/details', {
                method: serviceData.isNewDetail ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailResponse.ok) {
                const errorData = await detailResponse.json();
                throw new Error(`Failed to update service detail: ${errorData.error || 'Unknown error'}`);
            }

            showToast('Service updated successfully!', { type: 'success' });
            router.push('/admin/services/manager');
        } catch (error: any) {
            console.error('Error updating service:', error);
            showToast(error.message || 'Failed to update service. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        
        setSaving(true);
        try {
            // Delete detail if it exists
            if (service.id && !service.isNewDetail) {
                const detailRes = await fetch(`/api/pages/services/details?id=${service.id}`, {
                    method: 'DELETE',
                });

                if (!detailRes.ok) {
                    throw new Error('Failed to delete service details');
                }
            }

            // Delete post
            if (service.postId) {
                const postRes = await fetch(`/api/services?id=${service.postId}`, {
                    method: 'DELETE',
                });
                if (!postRes.ok) {
                    console.error('Failed to delete associated post');
                }
            }

            showToast('Service deleted successfully', { type: 'success' });
            router.push('/admin/services/manager');
        } catch (error: any) {
            console.error('Error deleting service:', error);
            showToast(error.message || 'Failed to delete service', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Service not found.</p>
                <button 
                    onClick={() => router.push('/admin/services/manager')}
                    className="mt-4 text-indigo-600 hover:underline"
                >
                    Back to Manager
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <ServiceForm 
                initialData={service}
                categories={categories}
                subcategories={subcategories}
                onSave={handleSave}
                onDelete={handleDelete}
                saving={saving}
                isNew={false}
            />
        </div>
    );
}
