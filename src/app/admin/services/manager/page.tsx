"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { showToast } from '@/components/Toast';
import ImageUploader from '@/components/shared/ImageUploader';
import IconSelector from "@/components/admin/IconSelector";
import { getBlogStatusLabel, getBlogStatusClasses } from "@/utils/statusHelpers";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

type ServicePost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    thumbnail?: string | null;
    icon?: string | null;
    featured: number;
    authorId: number;
    statusId: number;
    meta_title?: string | null;
    meta_description?: string | null;
    category_id?: number | null;
    subcategory_id?: number | null;
    price?: string | null;
    price_type?: string | null;
    price_label?: string | null;
    price_description?: string | null;
    createdAt: string;
    updatedAt: string;
};

export default function ServicesManagerPage() {
    const [activeTab, setActiveTab] = useState("hero");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Page Builder state
    const [heroData, setHeroData] = useState<any>({});
    const [servicesList, setServicesList] = useState<any[]>([]);
    const [processSection, setProcessSection] = useState<any>({});
    const [processSteps, setProcessSteps] = useState<any[]>([]);
    const [ctaData, setCtaData] = useState<any>({});
    const [deletedProcessSteps, setDeletedProcessSteps] = useState<number[]>([]);
    // Track deleted features so they can be deleted server-side on save
    const [deletedFeatures, setDeletedFeatures] = useState<string[]>([]);

    // New sections: Brands, Trust, Features
    const [brands, setBrands] = useState<any[]>([]);
    const [trustData, setTrustData] = useState<any>({});
    const [featuresList, setFeaturesList] = useState<any[]>([]);

    // Categories state
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    // Modal state
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<number | null>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [postsRes, heroRes, servicesRes, procSecRes, procStepsRes, ctaRes, categoriesRes, subcategoriesRes, brandsRes, trustRes, featuresRes] = await Promise.all([
                fetch('/api/services'),
                fetch('/api/pages/services/hero'),
                fetch('/api/pages/services/details?all=true'),
                fetch('/api/pages/services/process-section'),
                fetch('/api/pages/services/process-steps'),
                fetch('/api/pages/services/cta'),
                fetch('/api/pages/services/categories'),
                fetch('/api/pages/services/subcategories'),
                fetch('/api/pages/services/brands?admin=1'),
                fetch('/api/pages/services/trust?admin=1'),
                fetch('/api/pages/services/features?admin=1'),
            ]);

            const posts = postsRes.ok ? await postsRes.json() : [];
            const servicesDetails = servicesRes.ok ? await servicesRes.json() : [];
            const cats = categoriesRes.ok ? await categoriesRes.json() : [];
            const subs = subcategoriesRes.ok ? await subcategoriesRes.json() : [];
            const loadedBrands = brandsRes.ok ? await brandsRes.json() : [];
            const loadedTrust = trustRes.ok ? await trustRes.json() : null;
            const loadedFeatures = featuresRes.ok ? await featuresRes.json() : [];
            // Normalize brands: ensure id is set
            const normalizedBrands = Array.isArray(loadedBrands) ? loadedBrands.map((b: any) => ({ ...b, id: b.id ?? (b._id ? String(b._id) : undefined), is_active: typeof b.is_active === 'number' ? b.is_active : (b.is_active ? 1 : 0) })) : [];
            setBrands(normalizedBrands);
            if (loadedTrust) setTrustData(loadedTrust);
            // Normalize features: ensure each feature has an `id` property (copy from `_id`)
            const normalizedFeatures = Array.isArray(loadedFeatures) ? loadedFeatures.map((f: any) => ({ ...f, id: f.id ?? (f._id ? String(f._id) : undefined), is_active: typeof f.is_active === 'number' ? f.is_active : (f.is_active ? 1 : 0) })) : [];
            setFeaturesList(normalizedFeatures);
            console.log('Categories loaded:', cats);
            console.log('Subcategories loaded:', subs);
            setCategories(cats);
            setSubcategories(subs);

            const postsMap = new Map(posts.map((p: ServicePost) => [p.slug, p]));

            const mergedServices = servicesDetails.map((s: any) => {
                const post = (postsMap.get(s.key) || postsMap.get(s.slug)) as ServicePost | undefined;
                return {
                    ...s,
                    bullets: typeof s.bullets === 'string' ? JSON.parse(s.bullets) : s.bullets,
                    postId: post?.id,
                    slug: s.slug || post?.slug || s.key,
                    excerpt: post?.excerpt || s.description,
                    content: post?.content || `<p>${s.description}</p>`,
                    thumbnail: post?.thumbnail || s.image,
                    statusId: post?.statusId || 1,
                    metaTitle: post?.meta_title || s.title,
                    metaDescription: post?.meta_description || s.description,
                    createdAt: post?.createdAt || null,
                    category_id: post?.category_id,
                    subcategory_id: post?.subcategory_id,
                    price: post?.price,
                    price_type: post?.price_type,
                    price_label: post?.price_label,
                    price_description: post?.price_description,
                };
            });

            posts.forEach((post: ServicePost) => {
                const hasDetail = mergedServices.some((s: any) => s.postId === post.id);
                if (!hasDetail) {
                    mergedServices.push({
                        postId: post.id,
                        key: post.slug,
                        icon: post.icon || "design_services",
                        title: post.title,
                        description: post.excerpt,
                        bullets: [],
                        image: post.thumbnail,
                        image_alt: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        thumbnail: post.thumbnail,
                        statusId: post.statusId,
                        metaTitle: post.meta_title || post.title,
                        metaDescription: post.meta_description || post.excerpt,
                    });
                }
            });

            // De-duplicate services by slug (or key) — merge entries and prefer linked posts and detailed records.
            const dedupedMap = new Map<string, any>();
            const titleMap = new Map<string, string>(); // maps normalized title to slug in dedupedMap
            const canonicalSlug = (svc: any) => ((svc.slug || svc.key || '') as string).toLowerCase();
            const normalizeTitle = (t?: string) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

            for (const svc of mergedServices) {
                const slug = canonicalSlug(svc);
                if (!slug) {
                    // try to dedupe by normalized title if slug missing
                    const normTitle = normalizeTitle(svc.title);
                    if (normTitle && titleMap.has(normTitle)) {
                        const existingSlug = titleMap.get(normTitle)!;
                        const existing = dedupedMap.get(existingSlug);
                        // merge into existing
                        const merged = { ...existing };
                        if (!merged.postId && svc.postId) merged.postId = svc.postId;
                        merged.title = merged.title || svc.title;
                        merged.description = merged.description || svc.description || svc.excerpt;
                        merged.excerpt = merged.excerpt || svc.excerpt;
                        merged.content = merged.content || svc.content;
                        merged.thumbnail = merged.thumbnail || svc.thumbnail || svc.image;
                        merged.statusId = merged.statusId || svc.statusId || 1;
                        merged.metaTitle = merged.metaTitle || svc.metaTitle;
                        merged.metaDescription = merged.metaDescription || svc.metaDescription;
                        merged.category_id = merged.category_id || svc.category_id;
                        merged.subcategory_id = merged.subcategory_id || svc.subcategory_id;
                        merged.key = merged.key || svc.key;
                        merged.slug = merged.slug || svc.slug || svc.key;
                        dedupedMap.set(existingSlug, merged);
                    } else {
                        // create a temporary key for entries without slug
                        const tmpKey = `__no_slug__${Math.random()}`;
                        dedupedMap.set(tmpKey, svc);
                        if (svc.title) titleMap.set(normalizeTitle(svc.title), tmpKey);
                    }
                    continue;
                }

                const existing = dedupedMap.get(slug);
                if (!existing) {
                    dedupedMap.set(slug, { ...svc });
                    continue;
                }

                // Merge fields: prefer existing's detailed data, fall back to svc; prefer postId when present
                const merged = { ...existing };
                if (!merged.postId && svc.postId) merged.postId = svc.postId;
                merged.title = merged.title || svc.title;
                merged.description = merged.description || svc.description || svc.excerpt;
                merged.excerpt = merged.excerpt || svc.excerpt;
                merged.content = merged.content || svc.content;
                merged.thumbnail = merged.thumbnail || svc.thumbnail || svc.image;
                merged.statusId = merged.statusId || svc.statusId || 1;
                merged.metaTitle = merged.metaTitle || svc.metaTitle;
                merged.metaDescription = merged.metaDescription || svc.metaDescription;
                merged.category_id = merged.category_id || svc.category_id;
                merged.subcategory_id = merged.subcategory_id || svc.subcategory_id;
                merged.key = merged.key || svc.key;
                merged.slug = merged.slug || svc.slug || svc.key;

                dedupedMap.set(slug, merged);
                if (merged.title) titleMap.set(normalizeTitle(merged.title), slug);
            }
            // Convert deduped map to array and sort by createdAt desc (recent first)
            const servicesArray = Array.from(dedupedMap.values());
            servicesArray.sort((a: any, b: any) => {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
            });
            setServicesList(servicesArray);
            setHeroData(heroRes.ok ? await heroRes.json() : {});
            setProcessSection(procSecRes.ok ? await procSecRes.json() : {});
            // Normalize process steps to include `id` from `_id` and ensure numeric is_active/display_order
            const loadedSteps = procStepsRes.ok ? await procStepsRes.json() : [];
            const normalizedSteps = Array.isArray(loadedSteps) ? loadedSteps.map((s: any, i: number) => ({
                ...s,
                id: s.id ?? (s._id ? String(s._id) : undefined),
                is_active: typeof s.is_active === 'number' ? s.is_active : (s.is_active ? 1 : 0),
                display_order: s.display_order ?? s.order_index ?? (i + 1),
                step_number: s.step_number ?? s.order_index ?? (i + 1),
            })) : [];
            setProcessSteps(normalizedSteps);
            setCtaData(ctaRes.ok ? await ctaRes.json() : {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addServiceWithPost = () => {
        const newService = {
            key: `service-${Date.now()}`,
            icon: "design_services",
            title: "New Service",
            description: "Service description",
            bullets: [],
            image: "",
            image_alt: "Service image",
            slug: `service-${Date.now()}`,
            excerpt: "Service description",
            content: "<p>Service description</p>",
            thumbnail: "",
            statusId: 1,
            metaTitle: "New Service",
            metaDescription: "Service description",
            category_id: null,
            subcategory_id: null,
            price: null,
            price_type: 'fixed',
            price_label: null,
            price_description: null,
            isNew: true
        };
        setSelectedService(newService);
        setIsModalOpen(true);
    };

    const saveServiceWithPost = async () => {
        if (!selectedService) return;

        // Validate slug
        if (!selectedService.slug && !selectedService.key) {
            showToast('Please enter a slug for the service', { type: 'error' });
            return;
        }

        setSaving(true);
        try {
            const finalSlug = (selectedService.slug || selectedService.key).trim();

            if (!finalSlug) {
                showToast('Slug cannot be empty', { type: 'error' });
                setSaving(false);
                return;
            }

            console.log('Saving service with slug:', finalSlug);

            const postPayload = {
                title: selectedService.title,
                slug: finalSlug,
                excerpt: selectedService.excerpt || selectedService.description,
                content: selectedService.content || `<p>${selectedService.description}</p>`,
                thumbnail: selectedService.thumbnail || selectedService.image || null,
                icon: selectedService.icon,
                statusId: selectedService.statusId || 1,
                metaTitle: selectedService.metaTitle || selectedService.title,
                metaDescription: selectedService.metaDescription || selectedService.description,
                category_id: selectedService.category_id || null,
                subcategory_id: selectedService.subcategory_id || null,
                price: selectedService.price || null,
                price_type: selectedService.price_type || 'fixed',
                price_label: selectedService.price_label || null,
                price_description: selectedService.price_description || null,
            };

            let postResponse;
            if (selectedService.postId) {
                postResponse = await fetch('/api/services', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedService.postId, ...postPayload }),
                });
            } else {
                postResponse = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postPayload),
                });
            }

            if (!postResponse.ok) {
                const errorData = await postResponse.json();
                throw new Error(errorData.error || 'Failed to save service post');
            }
            const postData = await postResponse.json();

            const detailPayload: any = {
                key: finalSlug,
                slug: finalSlug,
                icon: selectedService.icon || 'design_services',
                title: selectedService.title || 'New Service',
                description: selectedService.description || selectedService.excerpt || 'Service description',
                bullets: JSON.stringify(selectedService.bullets || []),
                image: selectedService.image || selectedService.thumbnail || '/placeholder-service.jpg',
                image_alt: selectedService.image_alt || selectedService.title || 'Service image',
                display_order: selectedService.display_order ?? 0,
                is_active: 1,
                postId: postData.id || selectedService.postId,
            };

            // Add ID for updates
            if (selectedService.id) {
                detailPayload.id = selectedService.id;
            }

            const detailMethod = selectedService.id ? 'PUT' : 'POST';
            const detailResponse = await fetch('/api/pages/services/details', {
                method: detailMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailPayload),
            });

            if (!detailResponse.ok) {
                const errorData = await detailResponse.json();
                console.error('Detail save error:', errorData);
                throw new Error(`Failed to save service detail: ${errorData.error || 'Unknown error'}`);
            }

            showToast('Service saved successfully!', { type: 'success' });
            setIsModalOpen(false);
            setSelectedService(null);
            fetchAllData();
        } catch (error) {
            console.error('Error saving service:', error);
            showToast('Failed to save service. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async () => {
        if (!selectedService) return;
        if (!confirm(`Are you sure you want to delete "${selectedService.title}"?`)) return;

        setSaving(true);
        try {
            // Delete service detail first (if any), then delete the post to avoid FK conflicts
            if (selectedService.id) {
                const detailRes = await fetch(`/api/pages/services/details?id=${selectedService.id}`, {
                    method: 'DELETE',
                });
                if (!detailRes.ok) throw new Error('Failed to delete service detail');
            }

            if (selectedService.postId) {
                const postRes = await fetch(`/api/services?id=${selectedService.postId}`, {
                    method: 'DELETE',
                });
                if (!postRes.ok) throw new Error('Failed to delete service post');
            }

            showToast('Service deleted successfully!', { type: 'success' });
            setIsModalOpen(false);
            setSelectedService(null);
            fetchAllData();
        } catch (error) {
            console.error('Error deleting service:', error);
            showToast('Failed to delete service. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePageBuilder = async () => {
        setSaving(true);
        try {
            const promises = [];

            if (activeTab === "hero") {
                promises.push(
                    fetch('/api/pages/services/hero', {
                        method: heroData.id ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(heroData),
                    })
                );
            }

            if (activeTab === "process") {
                promises.push(
                    fetch('/api/pages/services/process-section', {
                        method: processSection.id ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(processSection),
                    })
                );

                processSteps.forEach((step, idx) => {
                    // Prefer client-side order_index when available (reordering), otherwise fall back to stored step_number/display_order
                    const stepNumber = step.order_index ?? step.step_number ?? (idx + 1);
                    const displayOrder = step.order_index ?? step.display_order ?? (idx + 1);
                    const payload: any = {
                        title: step.title,
                        description: step.description,
                        step_number: stepNumber,
                        display_order: displayOrder,
                        is_active: step.is_active !== undefined ? step.is_active : 1,
                    };
                    // Include id when updating
                    if (step.id) payload.id = step.id;

                    promises.push(
                        fetch('/api/pages/services/process-steps', {
                            method: step.id ? 'PUT' : 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        })
                    );
                });

                // Delete removed process steps via query param id
                deletedProcessSteps.forEach(id => {
                    promises.push(fetch(`/api/pages/services/process-steps?id=${id}`, { method: 'DELETE' }));
                });
            }

            if (activeTab === "cta") {
                promises.push(
                    fetch('/api/pages/services/cta', {
                        method: ctaData.id ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ctaData),
                    })
                );
            }

            // Brands
            if (activeTab === "brands") {
                for (const b of brands) {
                    const payload = { name: b.name, logo: b.logo || '', link: b.link || '', display_order: b.display_order ?? 0, is_active: b.is_active ?? 1 };
                    if (b.id) {
                        promises.push(fetch('/api/pages/services/brands', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, ...payload }) }));
                    } else {
                        promises.push(fetch('/api/pages/services/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
                    }
                }
            }

            // Trust
            if (activeTab === "trust") {
                const payload = {
                    id: trustData.id,
                    title: trustData.title || '',
                    description: trustData.description || '',
                    quote_text: trustData.quote_text || '',
                    quote_author: trustData.quote_author || '',
                    quote_role: trustData.quote_role || '',
                    quote_image: trustData.quote_image || '',
                    stat1_value: trustData.stat1_value || '',
                    stat1_label: trustData.stat1_label || '',
                    stat1_sublabel: trustData.stat1_sublabel || '',
                    stat2_value: trustData.stat2_value || '',
                    stat2_label: trustData.stat2_label || '',
                    stat2_sublabel: trustData.stat2_sublabel || '',
                    stat3_value: trustData.stat3_value || '',
                    stat3_label: trustData.stat3_label || '',
                    stat3_sublabel: trustData.stat3_sublabel || '',
                    is_active: trustData.is_active ?? 1
                };
                promises.push(fetch('/api/pages/services/trust', { method: trustData.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
            }
            const results = await Promise.all(promises);

            // Ensure all fetch responses were OK. If any failed (e.g., validation), surface the first error.
            for (const r of results) {
                if (r && typeof (r as any).ok !== 'undefined' && !(r as any).ok) {
                    // Try to read JSON error details
                    let details = '';
                    try {
                        const body = await (r as Response).json();
                        if (body && body.error) details = `: ${body.error}`;
                    } catch (e) {
                        // ignore parse errors
                    }
                    throw new Error(`One or more requests failed${details}`);
                }
            }

            showToast('Changes saved successfully!', { type: 'success' });
            setDeletedProcessSteps([]);
            setDeletedFeatures([]);
            fetchAllData();
        } catch (error) {
            console.error('Error saving:', error);
            showToast('Failed to save changes. Please try again.', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const updateItem = (field: string, value: any) => {
        if (!selectedService) return;
        setSelectedService({ ...selectedService, [field]: value });
    };

    const addBullet = () => {
        if (!selectedService) return;
        const bullets = [...(selectedService.bullets || []), ""];
        setSelectedService({ ...selectedService, bullets });
    };

    const updateBullet = (bulletIdx: number, value: string) => {
        if (!selectedService) return;
        const bullets = [...(selectedService.bullets || [])];
        bullets[bulletIdx] = value;
        setSelectedService({ ...selectedService, bullets });
    };

    const removeBullet = (bulletIdx: number) => {
        if (!selectedService) return;
        const bullets = [...(selectedService.bullets || [])];
        bullets.splice(bulletIdx, 1);
        setSelectedService({ ...selectedService, bullets });
    };

    const updateProcessStep = (index: number, field: string, value: any) => {
        const newSteps = [...processSteps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setProcessSteps(newSteps);
    };

    const addProcessStep = () => {
        setProcessSteps([...processSteps, {
            icon: "fact_check",
            title: "New Step",
            description: "Step description",
            order_index: processSteps.length + 1,
        }]);
    };

    const deleteProcessStep = (index: number) => {
        const step = processSteps[index];
        if (step.id) {
            setDeletedProcessSteps([...deletedProcessSteps, step.id]);
        }
        setProcessSteps(processSteps.filter((_, i) => i !== index));
    };

    const moveProcessStep = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) || (direction === "down" && index === processSteps.length - 1)) return;

        const newSteps = [...processSteps];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        newSteps.forEach((step, i) => { step.order_index = i + 1; });
        setProcessSteps(newSteps);
    };

    const filteredServices = servicesList.filter(service => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            service.title?.toLowerCase().includes(query) ||
            service.slug?.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query) ||
            service.key?.toLowerCase().includes(query)
        );
        const matchesStatus = statusFilter === null || service.statusId === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Arrange tabs to match frontend services page order:
    // Hero -> Features -> Services -> Process -> Brands -> Trust -> CTA
    const tabs = [
        { id: "hero", label: "Hero", icon: "web_asset" },
        { id: "services", label: "Services", icon: "design_services" },
        { id: "process", label: "Process", icon: "settings_suggest" },
        { id: "brands", label: "Brands", icon: "support_agent" },
        { id: "trust", label: "Trust", icon: "thumb_up" },
        { id: "cta", label: "CTA", icon: "campaign" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Services Manager</h1>
                    <div className="flex gap-2">
                        {activeTab !== "services" && (
                            <button
                                onClick={handleSavePageBuilder}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex gap-1 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto">

                    {/* HERO SECTION */}
                    {activeTab === "hero" && (
                        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                            <InputGroup label="Badge Text" value={heroData.badge_text || ''} onChange={(v: string) => setHeroData({ ...heroData, badge_text: v })} />
                            <InputGroup label="Tagline" value={heroData.tagline || ''} onChange={(v: string) => setHeroData({ ...heroData, tagline: v })} />
                            <InputGroup label="Title" value={heroData.title || ''} onChange={(v: string) => setHeroData({ ...heroData, title: v })} />
                            <TextAreaGroup label="Description" value={heroData.description || ''} onChange={(v: string) => setHeroData({ ...heroData, description: v })} />
                            <InputGroup label="Highlight Text (substring to emphasize)" value={heroData.highlight_text || ''} onChange={(v: string) => setHeroData({ ...heroData, highlight_text: v })} />

                            <div className="grid grid-cols-2 gap-5">
                                <InputGroup label="Primary CTA Text" value={heroData.primary_cta_text || ''} onChange={(v: string) => setHeroData({ ...heroData, primary_cta_text: v })} />
                                <InputGroup label="Primary CTA Link" value={heroData.primary_cta_link || ''} onChange={(v: string) => setHeroData({ ...heroData, primary_cta_link: v })} />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <InputGroup label="Secondary CTA Text" value={heroData.secondary_cta_text || ''} onChange={(v: string) => setHeroData({ ...heroData, secondary_cta_text: v })} />
                                <InputGroup label="Secondary CTA Link" value={heroData.secondary_cta_link || ''} onChange={(v: string) => setHeroData({ ...heroData, secondary_cta_link: v })} />
                            </div>

                            <ImageUploader label="Background Image" value={heroData.background_image || ''} onChange={(url: string) => setHeroData({ ...heroData, background_image: url })} folder="services" ratio="16:9" />
                            <InputGroup label="Background Image Alt Text" value={heroData.hero_image_alt || ''} onChange={(v: string) => setHeroData({ ...heroData, hero_image_alt: v })} />

                            <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                <Toggle checked={heroData.is_active === 1} onChange={(c: boolean) => setHeroData({ ...heroData, is_active: c ? 1 : 0 })} />
                            </div>
                        </div>
                    )}

                    {/* SERVICES SECTION */}
                    {activeTab === "services" && (
                        <div className="space-y-6">
                            {/* Search and Add */}
                            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <div className="flex-1">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                            search
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search services..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addServiceWithPost}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Service
                                </button>
                            </div>

                            {/* Services Grid */}
                            {filteredServices.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">design_services</span>
                                    <p className="text-slate-500 text-sm">No services found</p>
                                    <button
                                        onClick={addServiceWithPost}
                                        className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                    >
                                        Create your first service
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredServices.map((service) => (
                                        <div
                                            key={service.id || service.key}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="shrink-0">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-indigo-600 text-2xl">
                                                            {service.icon || "design_services"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-slate-900 truncate">{service.title}</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{service.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROCESS SECTION */}
                    {activeTab === "process" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Process Section</h3>
                                <InputGroup label="Title" value={processSection.title || ''} onChange={(v: string) => setProcessSection({ ...processSection, title: v })} />
                                <TextAreaGroup label="Description" value={processSection.description || ''} onChange={(v: string) => setProcessSection({ ...processSection, description: v })} />

                                <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                    <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                    <Toggle checked={processSection.is_active === 1} onChange={(c: boolean) => setProcessSection({ ...processSection, is_active: c ? 1 : 0 })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Process Steps</h3>
                                    <button
                                        onClick={addProcessStep}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Step
                                    </button>
                                </div>

                                {processSteps.map((step, idx) => (
                                    <div key={step.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-semibold text-slate-700">Step {idx + 1}</h4>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => moveProcessStep(idx, "up")}
                                                    disabled={idx === 0}
                                                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                                </button>
                                                <button
                                                    onClick={() => moveProcessStep(idx, "down")}
                                                    disabled={idx === processSteps.length - 1}
                                                    className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                                                </button>
                                                <button
                                                    onClick={() => deleteProcessStep(idx)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Icon</label>
                                            <IconSelector value={step.icon || ''} onChange={(v: string) => updateProcessStep(idx, 'icon', v)} />
                                        </div>
                                        <InputGroup label="Title" value={step.title || ''} onChange={(v: string) => updateProcessStep(idx, 'title', v)} />
                                        <TextAreaGroup label="Description" value={step.description || ''} onChange={(v: string) => updateProcessStep(idx, 'description', v)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA SECTION */}
                    {activeTab === "cta" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Call to Action</h3>
                                <InputGroup label="Title" value={ctaData.title || ''} onChange={(v: string) => setCtaData({ ...ctaData, title: v })} />
                                <TextAreaGroup label="Description" value={ctaData.description || ''} onChange={(v: string) => setCtaData({ ...ctaData, description: v })} />
                                <div className="grid grid-cols-2 gap-5">
                                    <InputGroup label="Button Text" value={ctaData.button_text || ''} onChange={(v: string) => setCtaData({ ...ctaData, button_text: v })} />
                                    <InputGroup label="Button Link" value={ctaData.button_link || ''} onChange={(v: string) => setCtaData({ ...ctaData, button_link: v })} />
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                    <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                    <Toggle checked={ctaData.is_active === 1} onChange={(c: boolean) => setCtaData({ ...ctaData, is_active: c ? 1 : 0 })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BRANDS SECTION */}
                    {activeTab === "brands" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Trusted Brands</h3>
                                <button
                                    onClick={() => setBrands([...brands, { name: 'New Brand', logo: '', link: '', display_order: brands.length + 1, is_active: 1 }])}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    <span className="material-symbols-outlined">add</span> Add Brand
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {brands.map((b, idx) => (
                                    <div key={b.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                        <InputGroup label="Name" value={b.name} onChange={(v: string) => { const copy = [...brands]; copy[idx] = { ...copy[idx], name: v }; setBrands(copy); }} />
                                        <InputGroup label="Link" value={b.link || ''} onChange={(v: string) => { const copy = [...brands]; copy[idx] = { ...copy[idx], link: v }; setBrands(copy); }} />
                                        <ImageUploader label="Logo" value={b.logo || ''} onChange={(url: string) => { const copy = [...brands]; copy[idx] = { ...copy[idx], logo: url }; setBrands(copy); }} folder="services/brands" ratio="1:1" />
                                        <div className="flex gap-2 items-center">
                                            <InputGroup label="Order" value={(b.display_order || 0).toString()} onChange={(v: string) => { const copy = [...brands]; copy[idx] = { ...copy[idx], display_order: parseInt(v || '0') || 0 }; setBrands(copy); }} />
                                            <div className="pt-2">
                                                <span className="text-sm font-medium text-gray-700 mr-2">Active</span>
                                                <Toggle checked={b.is_active === 1} onChange={(c: boolean) => { const copy = [...brands]; copy[idx] = { ...copy[idx], is_active: c ? 1 : 0 }; setBrands(copy); }} />
                                            </div>
                                            <button className="ml-auto text-red-600" onClick={() => { const copy = brands.filter((_, i) => i !== idx); setBrands(copy); }}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TRUST SECTION */}
                    {activeTab === "trust" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">Trust Section</h3>
                                <InputGroup label="Title" value={trustData.title || ''} onChange={(v: string) => setTrustData({ ...trustData, title: v })} />
                                <TextAreaGroup label="Description" value={trustData.description || ''} onChange={(v: string) => setTrustData({ ...trustData, description: v })} />
                                <TextAreaGroup label="Quote Text" value={trustData.quote_text || ''} onChange={(v: string) => setTrustData({ ...trustData, quote_text: v })} />
                                <InputGroup label="Quote Author" value={trustData.quote_author || ''} onChange={(v: string) => setTrustData({ ...trustData, quote_author: v })} />
                                <InputGroup label="Quote Role" value={trustData.quote_role || ''} onChange={(v: string) => setTrustData({ ...trustData, quote_role: v })} />
                                <ImageUploader label="Quote Image" value={trustData.quote_image || ''} onChange={(url: string) => setTrustData({ ...trustData, quote_image: url })} folder="services/trust" ratio="1:1" />

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-3">
                                        <InputGroup label="Stat 1 Value" value={trustData.stat1_value || ''} onChange={(v: string) => setTrustData({ ...trustData, stat1_value: v })} />
                                        <InputGroup label="Stat 1 Label" value={trustData.stat1_label || ''} onChange={(v: string) => setTrustData({ ...trustData, stat1_label: v })} />
                                        <InputGroup label="Stat 1 Sublabel" value={trustData.stat1_sublabel || ''} onChange={(v: string) => setTrustData({ ...trustData, stat1_sublabel: v })} />
                                    </div>
                                    <div className="space-y-3">
                                        <InputGroup label="Stat 2 Value" value={trustData.stat2_value || ''} onChange={(v: string) => setTrustData({ ...trustData, stat2_value: v })} />
                                        <InputGroup label="Stat 2 Label" value={trustData.stat2_label || ''} onChange={(v: string) => setTrustData({ ...trustData, stat2_label: v })} />
                                        <InputGroup label="Stat 2 Sublabel" value={trustData.stat2_sublabel || ''} onChange={(v: string) => setTrustData({ ...trustData, stat2_sublabel: v })} />
                                    </div>
                                    <div className="space-y-3">
                                        <InputGroup label="Stat 3 Value" value={trustData.stat3_value || ''} onChange={(v: string) => setTrustData({ ...trustData, stat3_value: v })} />
                                        <InputGroup label="Stat 3 Label" value={trustData.stat3_label || ''} onChange={(v: string) => setTrustData({ ...trustData, stat3_label: v })} />
                                        <InputGroup label="Stat 3 Sublabel" value={trustData.stat3_sublabel || ''} onChange={(v: string) => setTrustData({ ...trustData, stat3_sublabel: v })} />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                    <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                    <Toggle checked={trustData.is_active === 1} onChange={(c: boolean) => setTrustData({ ...trustData, is_active: c ? 1 : 0 })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SERVICE EDITOR MODAL */}
                    {isModalOpen && selectedService && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-indigo-600 text-xl">
                                                {selectedService.icon || "design_services"}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                {selectedService.isNew ? "New Service" : "Edit Service"}
                                            </h2>
                                            <p className="text-sm text-slate-500">{selectedService.slug || selectedService.key}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedService(null);
                                        }}
                                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-slate-600">close</span>
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column (Service Details + Pricing as separate cards) */}
                                            <div className="space-y-4">
                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Service Details</h4>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            value={selectedService.title}
                                                            onChange={(e) => updateItem('title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                                        <input
                                                            type="text"
                                                            value={selectedService.slug ?? selectedService.key ?? ''}
                                                            onChange={(e) => {
                                                                const newSlug = e.target.value;
                                                                setSelectedService({ ...selectedService, slug: newSlug, key: newSlug });
                                                            }}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                                        <IconSelector
                                                            value={selectedService.icon}
                                                            onChange={(v: string) => updateItem('icon', v)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                                                        <textarea
                                                            value={selectedService.description}
                                                            onChange={(e) => updateItem('description', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                                        <select
                                                            value={selectedService.statusId}
                                                            onChange={(e) => updateItem('statusId', Number(e.target.value))}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value={1}>Draft</option>
                                                            <option value={2}>Published</option>
                                                            <option value={3}>In Review</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <ImageUploader
                                                            label="Service Image"
                                                            value={selectedService.image || selectedService.thumbnail || ''}
                                                            onChange={(url: string) => {
                                                                updateItem('image', url);
                                                                updateItem('thumbnail', url);
                                                            }}
                                                            folder="services"
                                                            ratio="4:3"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Image Alt Text</label>
                                                        <input
                                                            type="text"
                                                            value={selectedService.image_alt}
                                                            onChange={(e) => updateItem('image_alt', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    {/* Category & Subcategory */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                                        <select
                                                            value={selectedService.category_id?.toString() || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value || null;
                                                                console.log('Category changed to:', val);
                                                                setSelectedService({ ...selectedService, category_id: val, subcategory_id: null });
                                                            }}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="">No Category</option>
                                                            {categories.map((cat: any) => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                        <p className="text-xs text-slate-500 mt-1">Categories available: {categories.length}</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
                                                        <select
                                                            value={selectedService.subcategory_id?.toString() || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value || null;
                                                                setSelectedService({ ...selectedService, subcategory_id: val });
                                                            }}
                                                            disabled={!selectedService.category_id}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                                        >
                                                            <option value="">No Subcategory</option>
                                                            {subcategories.filter((sub: any) => sub.category_id === selectedService.category_id).map((sub: any) => (
                                                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                                    <h5 className="text-sm font-semibold text-slate-700 mb-3">Pricing</h5>

                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                                            <input
                                                                type="text"
                                                                value={selectedService.price || ''}
                                                                onChange={(e) => updateItem('price', e.target.value)}
                                                                placeholder="499.00"
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                                                            <select
                                                                value={selectedService.currency || 'NPR'}
                                                                onChange={(e) => updateItem('currency', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="USD">USD ($)</option>
                                                                <option value="EUR">EUR (€)</option>
                                                                <option value="GBP">GBP (£)</option>
                                                                <option value="CAD">CAD (C$)</option>
                                                                <option value="AUD">AUD (A$)</option>
                                                                <option value="JPY">JPY (¥)</option>
                                                                <option value="INR">INR (₹)</option>
                                                                <option value="NPR">NPR (Rs.)</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price Type</label>
                                                            <select
                                                                value={selectedService.price_type || 'fixed'}
                                                                onChange={(e) => updateItem('price_type', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="fixed">Fixed</option>
                                                                <option value="starting">Starting At</option>
                                                                <option value="hourly">Hourly</option>
                                                                <option value="custom">Custom</option>
                                                            </select>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price Label</label>
                                                            <input
                                                                type="text"
                                                                value={selectedService.price_label || ''}
                                                                onChange={(e) => updateItem('price_label', e.target.value)}
                                                                placeholder="Starting at"
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price Description</label>
                                                            <textarea
                                                                value={selectedService.price_description || ''}
                                                                onChange={(e) => updateItem('price_description', e.target.value)}
                                                                rows={2}
                                                                placeholder="e.g. Pricing varies by scope and deliverables."
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Post Content</h4>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
                                                        <textarea
                                                            value={selectedService.excerpt}
                                                            onChange={(e) => updateItem('excerpt', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                                                        <RichTextEditor
                                                            value={selectedService.content}
                                                            onChange={(v: string) => updateItem('content', v)}
                                                        />
                                                    </div>

                                                </div>

                                                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">SEO</h4>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title</label>
                                                        <input
                                                            type="text"
                                                            value={selectedService.metaTitle}
                                                            onChange={(e) => updateItem('metaTitle', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description</label>
                                                        <textarea
                                                            value={selectedService.metaDescription}
                                                            onChange={(e) => updateItem('metaDescription', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Bullets Section */}
                                        <div className="border-t border-slate-300 pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Bullet Points</h4>
                                                <button
                                                    onClick={addBullet}
                                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                                    Add Bullet
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(selectedService.bullets || []).map((bullet: string, bulletIdx: number) => (
                                                    <div key={bulletIdx} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={bullet}
                                                            onChange={(e) => updateBullet(bulletIdx, e.target.value)}
                                                            placeholder={`Bullet point ${bulletIdx + 1}`}
                                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            onClick={() => removeBullet(bulletIdx)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!selectedService.bullets || selectedService.bullets.length === 0) && (
                                                    <p className="text-sm text-slate-500 italic">No bullet points yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                                        <button
                                            onClick={saveServiceWithPost}
                                            disabled={saving}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                                    Save Service
                                                </>
                                            )}
                                        </button>
                                        {!selectedService.isNew && (
                                            <button
                                                onClick={handleDeleteService}
                                                disabled={saving}
                                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                Delete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setSelectedService(null);
                                            }}
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Rich Text Editor Component
function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            LinkExtension.configure({
                openOnClick: false,
                autolink: true,
            }),
            Image.configure({
                allowBase64: true,
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url })
                .run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-slate-100 border-b border-slate-300 p-2 flex flex-wrap gap-1">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('bold')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Bold"
                >
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('italic')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Italic"
                >
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('underline')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Underline"
                >
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                </button>

                <div className="w-px bg-slate-300 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 })
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Heading 1"
                >
                    <span className="material-symbols-outlined text-[18px]">looks_one</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 })
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Heading 2"
                >
                    <span className="material-symbols-outlined text-[18px]">looks_two</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 3 })
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Heading 3"
                >
                    <span className="material-symbols-outlined text-[18px]">looks_3</span>
                </button>

                <div className="w-px bg-slate-300 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('bulletList')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Bullet List"
                >
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('orderedList')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Numbered List"
                >
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('codeBlock')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Code Block"
                >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                </button>

                <div className="w-px bg-slate-300 mx-1"></div>

                <button
                    onClick={addLink}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('link')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Add Link"
                >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                </button>

                <button
                    onClick={addImage}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Add Image"
                >
                    <span className="material-symbols-outlined text-[18px]">image</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded text-sm font-medium transition-colors ${editor.isActive('blockquote')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Quote"
                >
                    <span className="material-symbols-outlined text-[18px]">format_quote</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Horizontal Rule"
                >
                    <span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
                </button>

                <div className="w-px bg-slate-300 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Undo"
                >
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                </button>

                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Redo"
                >
                    <span className="material-symbols-outlined text-[18px]">redo</span>
                </button>
            </div>

            {/* Editor Content */}
            <div className="prose prose-sm max-w-none p-3 focus:outline-none min-h-64 bg-white">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-64 [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-0 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4 [&_.ProseMirror_li]:my-1 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-slate-600 [&_.ProseMirror_pre]:bg-slate-100 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded [&_.ProseMirror_code]:bg-slate-100 [&_.ProseMirror_code]:px-2 [&_.ProseMirror_code]:py-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto"
                />
            </div>
        </div>
    );
}

// Helper Components
function InputGroup({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
}

function TextAreaGroup({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
}
