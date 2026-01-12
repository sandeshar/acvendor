"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/shared/ImageUploader";
import { showToast } from '@/components/Toast';

export default function ContactPageUI() {
    const [activeTab, setActiveTab] = useState("hero");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- State Definitions ---
    const [heroData, setHeroData] = useState<any>({});
    const [contactInfo, setContactInfo] = useState<any>({});
    const [formConfig, setFormConfig] = useState<any>({});

    // --- Fetch Data ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [heroRes, infoRes, formRes] = await Promise.all([
                fetch('/api/pages/contact/hero'),
                fetch('/api/pages/contact/info'),
                fetch('/api/pages/contact/form-config'),
            ]);

            if (heroRes.ok) setHeroData(await heroRes.json());
            if (infoRes.ok) setContactInfo(await infoRes.json());
            if (formRes.ok) setFormConfig(await formRes.json());

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- Handlers ---
    const handleSave = async () => {
        setSaving(true);
        try {
            const saveSection = async (url: string, data: any) => {
                const entityId = data?.id ?? data?._id ?? null;
                const method = entityId ? 'PUT' : 'POST';
                const bodyData = entityId ? { ...data, id: entityId } : { ...data };
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData),
                });

                // Try to parse server response for better error messages
                let payload: any = null;
                try { payload = await res.json(); } catch (e) { /* ignore parse errors */ }

                if (!res.ok) {
                    const errMsg = payload?.error || payload?.message || `${res.status} ${res.statusText}`;
                    throw new Error(errMsg);
                }

                return payload;
            };

            // If contactInfo has no id, try to fetch existing info and merge so we perform an update instead of a bad create
            let infoPayload = contactInfo;
            if (!contactInfo?.id && !contactInfo?._id) {
                try {
                    const existingRes = await fetch('/api/pages/contact/info');
                    if (existingRes.ok) {
                        const existing = await existingRes.json();
                        infoPayload = { ...existing, ...contactInfo };
                    }
                } catch (e) { /* ignore */ }
            }

            const [heroRes, infoRes, formRes] = await Promise.all([
                saveSection('/api/pages/contact/hero', heroData),
                saveSection('/api/pages/contact/info', infoPayload),
                saveSection('/api/pages/contact/form-config', formConfig),
            ]);

            // If the contact info endpoint returned the updated document, use it to update local state immediately
            if (infoRes && infoRes.data) {
                setContactInfo(infoRes.data);
            } else {
                // fallback to re-fetching everything
                await fetchData();
            }

            showToast("Settings saved successfully!", { type: 'success' });
        } catch (error) {
            console.error("Error saving settings:", error);
            const msg = error instanceof Error ? error.message : String(error);
            showToast(`Failed to save settings: ${msg}`, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "hero", label: "Hero" },
        { id: "info", label: "Contact Info" },
        { id: "form", label: "Form Config" },
    ];

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Contact Page</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="w-full mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-md"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">

                    {/* HERO SECTION */}
                    {activeTab === "hero" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">flag</span>
                                    Hero Configuration
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Badge Text" value={heroData.badge_text || ''} onChange={(v) => setHeroData({ ...heroData, badge_text: v })} />
                                    <InputGroup label="Tagline" value={heroData.tagline || ''} onChange={(v) => setHeroData({ ...heroData, tagline: v })} />
                                    <InputGroup label="Title" value={heroData.title || ''} onChange={(v) => setHeroData({ ...heroData, title: v })} />
                                    <InputGroup label="Highlight Text" value={heroData.highlight_text || ''} onChange={(v) => setHeroData({ ...heroData, highlight_text: v })} />
                                    <TextAreaGroup label="Description" value={heroData.description || ''} onChange={(v) => setHeroData({ ...heroData, description: v })} />
                                    <ImageUploader label="Background Image" value={heroData.background_image || ''} onChange={(v) => setHeroData({ ...heroData, background_image: v })} folder="contact" ratio="16:9" />
                                    <InputGroup label="Image Alt Text" value={heroData.hero_image_alt || ''} onChange={(v) => setHeroData({ ...heroData, hero_image_alt: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={heroData.is_active === 1} onChange={(c) => setHeroData({ ...heroData, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTACT INFO SECTION */}
                    {activeTab === "info" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">contact_phone</span>
                                    Contact Information
                                </h2>
                                <div className="space-y-5">
                                    <InputGroup label="Section Title" value={contactInfo.info_title || ''} onChange={(v) => setContactInfo({ ...contactInfo, info_title: v })} />
                                    <TextAreaGroup label="Section Description" value={contactInfo.info_description || ''} onChange={(v) => setContactInfo({ ...contactInfo, info_description: v })} />

                                    <InputGroup label="Office Location" value={contactInfo.office_location || ''} onChange={(v) => setContactInfo({ ...contactInfo, office_location: v })} />
                                    <InputGroup label="Phone Number (Primary)" value={contactInfo.phone || ''} onChange={(v) => setContactInfo({ ...contactInfo, phone: v })} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Sales Hotline (Number)" value={contactInfo.phone_item_1_number || ''} onChange={(v) => setContactInfo({ ...contactInfo, phone_item_1_number: v })} />
                                        <InputGroup label="Sales Hotline (Subtext)" value={contactInfo.phone_item_1_subtext || ''} onChange={(v) => setContactInfo({ ...contactInfo, phone_item_1_subtext: v })} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <InputGroup label="Service Support (Number)" value={contactInfo.phone_item_2_number || ''} onChange={(v) => setContactInfo({ ...contactInfo, phone_item_2_number: v })} />
                                        <InputGroup label="Service Support (Subtext)" value={contactInfo.phone_item_2_subtext || ''} onChange={(v) => setContactInfo({ ...contactInfo, phone_item_2_subtext: v })} />
                                    </div>

                                    <InputGroup label="WhatsApp Title" value={contactInfo.whatsapp_title || ''} onChange={(v) => setContactInfo({ ...contactInfo, whatsapp_title: v })} />
                                    <InputGroup label="WhatsApp Subtext" value={contactInfo.whatsapp_subtext || ''} onChange={(v) => setContactInfo({ ...contactInfo, whatsapp_subtext: v })} />
                                    <InputGroup label="WhatsApp Number (international, no +)" value={contactInfo.whatsapp_number || ''} onChange={(v) => setContactInfo({ ...contactInfo, whatsapp_number: v })} />

                                    <InputGroup label="Location Title" value={contactInfo.location_title || ''} onChange={(v) => setContactInfo({ ...contactInfo, location_title: v })} />
                                    <InputGroup label="Opening Hours Title" value={contactInfo.opening_hours_title || ''} onChange={(v) => setContactInfo({ ...contactInfo, opening_hours_title: v })} />
                                    <TextAreaGroup label="Opening Hours Text (use newline for line breaks)" value={contactInfo.opening_hours_text || ''} onChange={(v) => setContactInfo({ ...contactInfo, opening_hours_text: v })} />

                                    <InputGroup label="Email Address" value={contactInfo.email || ''} onChange={(v) => setContactInfo({ ...contactInfo, email: v })} />

                                    <TextAreaGroup label="Map Description (short blurb shown over the map)" value={contactInfo.map_description || ''} onChange={(v) => setContactInfo({ ...contactInfo, map_description: v })} />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps Embed URL</label>
                                        <textarea
                                            value={contactInfo.map_url || ''}
                                            onChange={(e) => setContactInfo({ ...contactInfo, map_url: e.target.value })}
                                            placeholder="Paste your Google Maps embed URL here (e.g., https://www.google.com/maps/embed?pb=...)"
                                            rows={3}
                                            className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary sm:text-sm transition-all duration-200 py-2.5 px-4 resize-none font-mono text-xs"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">To get the embed URL: Open Google Maps → Click Share → Embed a map → Copy the src URL</p>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={contactInfo.is_active === 1} onChange={(c) => setContactInfo({ ...contactInfo, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FORM CONFIG SECTION */}
                    {activeTab === "form" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">edit_note</span>
                                    Form Configuration
                                </h2>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Name Placeholder" value={formConfig.name_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, name_placeholder: v })} />
                                        <InputGroup label="Email Placeholder" value={formConfig.email_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, email_placeholder: v })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Phone Placeholder" value={formConfig.phone_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, phone_placeholder: v })} />
                                        <InputGroup label="Subject Placeholder" value={formConfig.subject_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, subject_placeholder: v })} />
                                    </div>
                                    <InputGroup label="Service Placeholder" value={formConfig.service_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, service_placeholder: v })} />
                                    <InputGroup label="Message Placeholder" value={formConfig.message_placeholder || ''} onChange={(v) => setFormConfig({ ...formConfig, message_placeholder: v })} />
                                    <InputGroup label="Submit Button Text" value={formConfig.submit_button_text || ''} onChange={(v) => setFormConfig({ ...formConfig, submit_button_text: v })} />
                                    <InputGroup label="Success Message" value={formConfig.success_message || ''} onChange={(v) => setFormConfig({ ...formConfig, success_message: v })} />

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Form</span>
                                        <Toggle checked={formConfig.is_active === 1} onChange={(c) => setFormConfig({ ...formConfig, is_active: c ? 1 : 0 })} />
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

// --- Reusable Components ---

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary sm:text-sm transition-all duration-200 py-2.5 px-4"
            />
        </div>
    );
}

function TextAreaGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary sm:text-sm transition-all duration-200 py-2.5 px-4 resize-none"
            />
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}
