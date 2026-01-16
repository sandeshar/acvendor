"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { showToast } from '@/components/Toast';
import ImageUploader from '@/components/shared/ImageUploader';
import IconSelector from "@/components/admin/IconSelector";
import { stripHtml } from '@/utils/stripHtml';

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
    const [deletedFeatures, setDeletedFeatures] = useState<string[]>([]);

    // New sections: Brands, Trust, Features
    const [brands, setBrands] = useState<any[]>([]);
    const [trustData, setTrustData] = useState<any>({});
    const [featuresList, setFeaturesList] = useState<any[]>([]);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [postsRes, heroRes, servicesRes, procSecRes, procStepsRes, ctaRes, brandsRes, trustRes, featuresRes] = await Promise.all([
                fetch("/api/services"),
                fetch("/api/pages/services/hero"),
                fetch("/api/pages/services/details?all=true"),
                fetch("/api/pages/services/process-section"),
                fetch("/api/pages/services/process-steps"),
                fetch("/api/pages/services/cta"),
                fetch("/api/pages/services/brands?admin=1"),
                fetch("/api/pages/services/trust?admin=1"),
                fetch("/api/pages/services/features?admin=1"),
            ]);

            const posts = postsRes.ok ? await postsRes.json() : [];
            const servicesDetails = servicesRes.ok ? await servicesRes.json() : [];
            const loadedBrands = brandsRes.ok ? await brandsRes.json() : [];
            const loadedTrust = trustRes.ok ? await trustRes.json() : null;
            const loadedFeatures = featuresRes.ok ? await featuresRes.json() : [];

            const normalizedBrands = Array.isArray(loadedBrands) ? loadedBrands.map((b: any) => ({
                ...b,
                id: b.id ?? (b._id ? String(b._id) : undefined),
                is_active: typeof b.is_active === "number" ? b.is_active : (b.is_active ? 1 : 0)
            })) : [];
            setBrands(normalizedBrands);

            if (loadedTrust) setTrustData(loadedTrust);

            const normalizedFeatures = Array.isArray(loadedFeatures) ? loadedFeatures.map((f: any) => ({
                ...f,
                id: f.id ?? (f._id ? String(f._id) : undefined),
                is_active: typeof f.is_active === "number" ? f.is_active : (f.is_active ? 1 : 0)
            })) : [];
            setFeaturesList(normalizedFeatures);

            const postsMap = new Map(posts.map((p: ServicePost) => [p.slug, p]));

            const mergedServices = servicesDetails.map((s: any) => {
                const post = (postsMap.get(s.key) || postsMap.get(s.slug)) as ServicePost | undefined;
                return {
                    ...s,
                    bullets: typeof s.bullets === "string" ? JSON.parse(s.bullets) : s.bullets,
                    postId: post?.id,
                    slug: s.slug || post?.slug || s.key,
                    excerpt: post?.excerpt || s.description,
                    content: post?.content || "",
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
                        slug: post.slug,
                        statusId: post.statusId,
                    });
                }
            });

            const dedupedMap = new Map<string, any>();
            for (const svc of mergedServices) {
                const slug = (svc.slug || svc.key || "").toLowerCase();
                if (!slug) continue;
                if (!dedupedMap.has(slug)) {
                    dedupedMap.set(slug, { ...svc });
                } else {
                    const existing = dedupedMap.get(slug);
                    dedupedMap.set(slug, { ...existing, ...svc });
                }
            }

            const servicesArray = Array.from(dedupedMap.values());
            servicesArray.sort((a: any, b: any) => {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
            });
            setServicesList(servicesArray);

            setHeroData(heroRes.ok ? await heroRes.json() : {});
            setProcessSection(procSecRes.ok ? await procSecRes.json() : {});

            const loadedSteps = procStepsRes.ok ? await procStepsRes.json() : [];
            const normalizedSteps = Array.isArray(loadedSteps) ? loadedSteps.map((s: any, i: number) => ({
                ...s,
                id: s.id ?? (s._id ? String(s._id) : undefined),
                is_active: typeof s.is_active === "number" ? s.is_active : (s.is_active ? 1 : 0),
                display_order: s.display_order ?? s.order_index ?? (i + 1),
                step_number: s.step_number ?? s.order_index ?? (i + 1),
            })) : [];
            setProcessSteps(normalizedSteps);
            setCtaData(ctaRes.ok ? await ctaRes.json() : {});
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePageBuilder = async () => {
        setSaving(true);
        try {
            const promises = [];

            if (activeTab === "hero") {
                promises.push(
                    fetch("/api/pages/services/hero", {
                        method: heroData.id ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(heroData),
                    })
                );
            }

            if (activeTab === "process") {
                promises.push(
                    fetch("/api/pages/services/process-section", {
                        method: processSection.id ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(processSection),
                    })
                );

                processSteps.forEach((step, idx) => {
                    const payload: any = {
                        title: step.title,
                        description: step.description,
                        step_number: step.step_number || (idx + 1),
                        display_order: step.display_order || (idx + 1),
                        is_active: step.is_active ?? 1,
                        icon: step.icon || "fact_check",
                    };
                    if (step.id) payload.id = step.id;

                    promises.push(
                        fetch("/api/pages/services/process-steps", {
                            method: step.id ? "PUT" : "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        })
                    );
                });

                deletedProcessSteps.forEach(id => {
                    promises.push(fetch(`/api/pages/services/process-steps?id=${id}`, { method: "DELETE" }));
                });
            }

            if (activeTab === "cta") {
                promises.push(
                    fetch("/api/pages/services/cta", {
                        method: ctaData.id ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(ctaData),
                    })
                );
            }

            if (activeTab === "brands") {
                for (const b of brands) {
                    const payload = { name: b.name, logo: b.logo || "", link: b.link || "", display_order: b.display_order ?? 0, is_active: b.is_active ?? 1 };
                    if (b.id) {
                        promises.push(fetch("/api/pages/services/brands", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, ...payload }) }));
                    } else {
                        promises.push(fetch("/api/pages/services/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
                    }
                }
            }

            if (activeTab === "trust") {
                const payload = { ...trustData };
                promises.push(fetch("/api/pages/services/trust", { method: trustData.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
            }

            if (activeTab === "features") {
                for (const f of featuresList) {
                    const payload = { ...f };
                    if (f.id) {
                        promises.push(fetch("/api/pages/services/features", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
                    } else {
                        promises.push(fetch("/api/pages/services/features", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
                    }
                }
                for (const id of deletedFeatures) {
                    promises.push(fetch(`/api/pages/services/features?id=${id}`, { method: "DELETE" }));
                }
            }

            await Promise.all(promises);
            showToast("Changes saved successfully!", { type: "success" });
            setDeletedProcessSteps([]);
            setDeletedFeatures([]);
            fetchAllData();
        } catch (error) {
            console.error("Error saving:", error);
            showToast("Failed to save changes. Please try again.", { type: "error" });
        } finally {
            setSaving(false);
        }
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
            step_number: processSteps.length + 1,
            display_order: processSteps.length + 1,
            is_active: 1
        }]);
    };

    const deleteProcessStep = (index: number) => {
        const step = processSteps[index];
        if (step.id) setDeletedProcessSteps([...deletedProcessSteps, step.id]);
        setProcessSteps(processSteps.filter((_, i) => i !== index));
    };

    const moveProcessStep = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) || (direction === "down" && index === processSteps.length - 1)) return;
        const newSteps = [...processSteps];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        newSteps.forEach((step, i) => {
            step.step_number = i + 1;
            step.display_order = i + 1;
        });
        setProcessSteps(newSteps);
    };

    const updateFeature = (index: number, field: string, value: any) => {
        const newList = [...featuresList];
        newList[index] = { ...newList[index], [field]: value };
        setFeaturesList(newList);
    };

    const addFeature = () => {
        setFeaturesList([...featuresList, {
            title: "New Feature",
            description: "",
            icon: "star",
            display_order: featuresList.length + 1,
            is_active: 1
        }]);
    };

    const deleteFeature = (index: number) => {
        const feat = featuresList[index];
        if (feat.id) setDeletedFeatures([...deletedFeatures, feat.id]);
        setFeaturesList(featuresList.filter((_, i) => i !== index));
    };

    const filteredServices = servicesList.filter(service => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            service.title?.toLowerCase().includes(query) ||
            service.slug?.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query)
        );
        return matchesSearch;
    });

    const tabs = [
        { id: "services", label: "Services", icon: "design_services" },

        { id: "hero", label: "Hero", icon: "web_asset" },
        { id: "features", label: "Features", icon: "star" },
        { id: "process", label: "Process", icon: "settings_suggest" },
        { id: "brands", label: "Brands", icon: "support_agent" },
        { id: "trust", label: "Trust", icon: "thumb_up" },
        { id: "cta", label: "CTA", icon: "campaign" },
    ];

    if (loading) return <div className="p-10 text-center text-slate-500">Loading Manager...</div>;

    return (
        <div className="w-full min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">settings_applications</span>
                        <h1 className="text-lg font-bold text-slate-800">Services Manager</h1>
                    </div>
                    <div className="flex gap-2">
                        {activeTab !== "services" && (
                            <button
                                onClick={handleSavePageBuilder}
                                disabled={saving}
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
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
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex gap-1 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? "bg-primary text-white shadow-md"
                                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    {activeTab === "hero" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-4">Hero Content</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Badge Text" value={heroData.badge_text || ""} onChange={(v) => setHeroData({ ...heroData, badge_text: v })} />
                                    <InputGroup label="Tagline" value={heroData.tagline || ""} onChange={(v) => setHeroData({ ...heroData, tagline: v })} />
                                </div>
                                <InputGroup label="Headline Title" value={heroData.title || ""} onChange={(v) => setHeroData({ ...heroData, title: v })} />
                                <TextAreaGroup label="Description" value={heroData.description || ""} onChange={(v) => setHeroData({ ...heroData, description: v })} />
                                <InputGroup label="Highlight Text" value={heroData.highlight_text || ""} onChange={(v) => setHeroData({ ...heroData, highlight_text: v })} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                                    <InputGroup label="Primary Button Text" value={heroData.primary_cta_text || ""} onChange={(v) => setHeroData({ ...heroData, primary_cta_text: v })} />
                                    <InputGroup label="Primary Button Link" value={heroData.primary_cta_link || ""} onChange={(v) => setHeroData({ ...heroData, primary_cta_link: v })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Secondary Button Text" value={heroData.secondary_cta_text || ""} onChange={(v) => setHeroData({ ...heroData, secondary_cta_text: v })} />
                                    <InputGroup label="Secondary Button Link" value={heroData.secondary_cta_link || ""} onChange={(v) => setHeroData({ ...heroData, secondary_cta_link: v })} />
                                </div>

                                <div className="border-t pt-6">
                                    <ImageUploader label="Background Hero Image" value={heroData.background_image || ""} onChange={(url) => setHeroData({ ...heroData, background_image: url })} folder="services" ratio="16:9" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "features" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Manage top-level features displayed on the services page.</p>
                                <button onClick={addFeature} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined">add</span> Add Feature
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {featuresList.map((f, idx) => (
                                    <div key={f.id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <IconSelector value={f.icon || "star"} onChange={(v) => updateFeature(idx, "icon", v)} />
                                            <button onClick={() => deleteFeature(idx)} className="text-slate-400 hover:text-red-600 p-1">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        <InputGroup label="Title" value={f.title} onChange={(v) => updateFeature(idx, "title", v)} />
                                        <TextAreaGroup label="Description" value={f.description} onChange={(v) => updateFeature(idx, "description", v)} rows={2} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "services" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by title or slug..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <NextLink
                                    href="/admin/services/new"
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Create New Service
                                </NextLink>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredServices.map((service) => (
                                    <NextLink
                                        key={service.slug || service.postId || service.id}
                                        href={`/admin/services/edit/${service.slug}`}
                                        className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary-400 transition-all flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                            <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">
                                                {service.icon || "design_services"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{service.title}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{stripHtml(service.description || service.excerpt || '')}</p>
                                        </div>
                                    </NextLink>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "process" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-4">Process Introduction</h3>
                                <InputGroup label="Section Title" value={processSection.title || ""} onChange={(v) => setProcessSection({ ...processSection, title: v })} />
                                <TextAreaGroup label="Section Description" value={processSection.description || ""} onChange={(v) => setProcessSection({ ...processSection, description: v })} />
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <h3 className="font-bold text-slate-800">Workflow Steps</h3>
                                <button onClick={addProcessStep} className="text-primary hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined">add</span> Add Process Step
                                </button>
                            </div>

                            <div className="space-y-4">
                                {processSteps.map((step, idx) => (
                                    <div key={step.id || idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex flex-col items-center gap-2">
                                            <IconSelector value={step.icon || ""} onChange={(v) => updateProcessStep(idx, "icon", v)} />
                                            <div className="flex gap-1">
                                                <button onClick={() => moveProcessStep(idx, "up")} disabled={idx === 0} className="p-1 text-slate-400 hover:text-primary disabled:opacity-20"><span className="material-symbols-outlined text-sm">expand_less</span></button>
                                                <button onClick={() => moveProcessStep(idx, "down")} disabled={idx === processSteps.length - 1} className="p-1 text-slate-400 hover:text-primary disabled:opacity-20"><span className="material-symbols-outlined text-sm">expand_more</span></button>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <InputGroup label={`Step ${idx + 1} Title`} value={step.title || ""} onChange={(v) => updateProcessStep(idx, "title", v)} />
                                            <TextAreaGroup label="Step Description" value={step.description || ""} onChange={(v) => updateProcessStep(idx, "description", v)} rows={2} />
                                        </div>
                                        <button onClick={() => deleteProcessStep(idx)} className="text-slate-300 hover:text-red-500 mt-2 transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "brands" && (
                        <div className="space-y-6">
                            <div className="flex justify-end p-2">
                                <button onClick={() => setBrands([...brands, { name: "New Brand", logo: "", link: "", display_order: brands.length + 1, is_active: 1 }])} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">
                                    Add Brand Logo
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {brands.map((b, idx) => (
                                    <div key={b.id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand {idx + 1}</span>
                                            <button onClick={() => setBrands(brands.filter((_, i) => i !== idx))} className="text-slate-300 group-hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">cancel</span>
                                            </button>
                                        </div>
                                        <ImageUploader label="Logo" value={b.logo || ""} onChange={(url) => { const copy = [...brands]; copy[idx].logo = url; setBrands(copy); }} folder="services/brands" ratio="1:1" />
                                        <InputGroup label="Name" value={b.name} onChange={(v) => { const copy = [...brands]; copy[idx].name = v; setBrands(copy); }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "trust" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b pb-4">Social Proof & Trust</h3>
                                <InputGroup label="Section Title" value={trustData.title || ""} onChange={(v) => setTrustData({ ...trustData, title: v })} />
                                <TextAreaGroup label="Intro Text" value={trustData.description || ""} onChange={(v) => setTrustData({ ...trustData, description: v })} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Featured Testimonial</h4>
                                        <TextAreaGroup label="Quote" value={trustData.quote_text || ""} onChange={(v) => setTrustData({ ...trustData, quote_text: v })} />
                                        <InputGroup label="Author" value={trustData.quote_author || ""} onChange={(v) => setTrustData({ ...trustData, quote_author: v })} />
                                        <InputGroup label="Role" value={trustData.quote_role || ""} onChange={(v) => setTrustData({ ...trustData, quote_role: v })} />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <ImageUploader label="Author Photo" value={trustData.quote_image || ""} onChange={(url) => setTrustData({ ...trustData, quote_image: url })} folder="services/trust" ratio="1:1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <InputGroup label="Stat 1 Value" value={trustData.stat1_value || ""} onChange={(v) => setTrustData({ ...trustData, stat1_value: v })} />
                                        <InputGroup label="Label" value={trustData.stat1_label || ""} onChange={(v) => setTrustData({ ...trustData, stat1_label: v })} />
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <InputGroup label="Stat 2 Value" value={trustData.stat2_value || ""} onChange={(v) => setTrustData({ ...trustData, stat2_value: v })} />
                                        <InputGroup label="Label" value={trustData.stat2_label || ""} onChange={(v) => setTrustData({ ...trustData, stat2_label: v })} />
                                    </div>
                                    <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <InputGroup label="Stat 3 Value" value={trustData.stat3_value || ""} onChange={(v) => setTrustData({ ...trustData, stat3_value: v })} />
                                        <InputGroup label="Label" value={trustData.stat3_label || ""} onChange={(v) => setTrustData({ ...trustData, stat3_label: v })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "cta" && (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 text-center">Closing Call to Action</h3>
                            <InputGroup label="Headline" value={ctaData.title || ""} onChange={(v) => setCtaData({ ...ctaData, title: v })} />
                            <TextAreaGroup label="Subtext" value={ctaData.description || ""} onChange={(v) => setCtaData({ ...ctaData, description: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Button Label" value={ctaData.button_text || ""} onChange={(v) => setCtaData({ ...ctaData, button_text: v })} />
                                <InputGroup label="Button URL" value={ctaData.button_link || ""} onChange={(v) => setCtaData({ ...ctaData, button_link: v })} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
            />
        </div>
    );
}

function TextAreaGroup({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none placeholder:text-slate-300"
            />
        </div>
    );
}
