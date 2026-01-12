"use client";

import { useEffect, useState } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

interface Project {
    id?: string;
    title: string;
    category: string;
    location: string;
    capacity: string;
    system: string;
    image: string;
    display_order: number;
    is_active: boolean;
}

interface ProjectSection {
    id?: string;
    badge_text?: string;
    title?: string;
    description?: string;
    background_image?: string;
    cta_title?: string;
    cta_description?: string;
    cta_button_text?: string;
    cta_button_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    // Review / Testimonial
    review_text?: string;
    review_author_name?: string;
    review_author_title?: string;
    review_author_image?: string;
    is_active?: number;
}

export default function AdminProjectsPage() {
    const [section, setSection] = useState<ProjectSection>({});
    const [sectionDraft, setSectionDraft] = useState<ProjectSection>({});
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'hero' | 'cta' | 'projects'>('hero');

    // Project Form State
    const [editingProject, setEditingProject] = useState<string | 'new' | null>(null);
    const [projectForm, setProjectForm] = useState<Project>({
        title: '',
        category: 'Commercial',
        location: '',
        capacity: '',
        system: '',
        image: '',
        display_order: 0,
        is_active: true
    });

    // Small helper components (Input / Textarea / Toggle) to match admin/ui/home style
    function InputGroup({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary sm:text-sm transition-all duration-200 py-2.5 px-4"
                />
            </div>
        );
    }

    function TextAreaGroup({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary sm:text-sm transition-all duration-200 py-2.5 px-4 resize-none"
                />
            </div>
        );
    }

    function Toggle({ checked, onChange }: { checked: boolean, onChange: (c: boolean) => void }) {
        return (
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        );
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sectionRes, projectsRes] = await Promise.all([
                fetch('/api/pages/projects/section'),
                fetch('/api/projects?admin=true')
            ]);

            if (!sectionRes.ok || !projectsRes.ok) {
                console.error('Fetch failed:', sectionRes.status, projectsRes.status);
            }

            const s = await sectionRes.json().catch(() => ({}));
            const p = await projectsRes.json().catch(() => ([]));

            const validSection = s && !s.error ? s : {};
            setSection(validSection);
            setSectionDraft(validSection);
            setProjects(Array.isArray(p) ? p : []);

            if (p && p.error) {
                showToast(p.error, { type: 'error' });
            }
        } catch (e) {
            console.error('Failed to fetch projects data', e);
            showToast('Failed to load projects', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSection = async (e?: React.FormEvent) => {
        try { (e as any)?.preventDefault?.(); } catch (err) { /* ignore */ }
        setSaving(true);
        try {
            const res = await fetch('/api/pages/projects/section', {
                method: sectionDraft?.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionDraft)
            });
            if (res.ok) {
                showToast('Section updated successfully', { type: 'success' });
                // Refresh from server so we have canonical saved values (and IDs)
                await fetchData();
            } else {
                const err = await res.json().catch(() => null);
                console.error('Save failed', err);
                throw new Error('Save failed');
            }
        } catch (e) {
            showToast('Failed to save section', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProject = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/projects', {
                method: projectForm?.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectForm)
            });
            if (res.ok) {
                showToast(projectForm?.id ? 'Project updated' : 'Project created', { type: 'success' });
                setEditingProject(null);
                setProjectForm({
                    title: '',
                    category: 'Commercial',
                    location: '',
                    capacity: '',
                    system: '',
                    image: '',
                    display_order: 0,
                    is_active: true
                });
                fetchData();
            } else {
                throw new Error('Save failed');
            }
        } catch (e) {
            showToast('Failed to save project', { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Project deleted', { type: 'success' });
                fetchData();
            }
        } catch (e) {
            showToast('Delete failed', { type: 'error' });
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <button
                        onClick={handleSaveSection}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full mx-auto px-6 py-6 max-w-7xl">
                <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('hero')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'hero' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Hero
                        </button>
                        <button
                            onClick={() => setActiveTab('cta')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'cta' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            CTA
                        </button>

                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'projects' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Projects
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto space-y-12">

                {/* Section Settings */}
                {(activeTab === 'hero' || activeTab === 'cta') && (
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Hero & CTA</h2>



                        <form onSubmit={handleSaveSection} className="grid grid-cols-1 gap-6">

                            {activeTab === 'hero' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Badge Text</label>
                                        <input
                                            type="text"
                                            value={sectionDraft?.badge_text || ''}
                                            onChange={e => setSectionDraft({ ...sectionDraft, badge_text: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={sectionDraft?.title || ''}
                                            onChange={e => setSectionDraft({ ...sectionDraft, title: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                        <textarea
                                            value={sectionDraft?.description || ''}
                                            onChange={e => setSectionDraft({ ...sectionDraft, description: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hero Image</label>
                                        <ImageUploader
                                            value={sectionDraft?.background_image || ''}
                                            onChange={url => setSectionDraft({ ...sectionDraft, background_image: url })}
                                            folder="projects"
                                            label="Background Image"
                                            ratio="16:9"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cta' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CTA Title</label>
                                        <input
                                            type="text"
                                            value={sectionDraft?.cta_title || ''}
                                            onChange={e => setSectionDraft({ ...sectionDraft, cta_title: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CTA Description</label>
                                        <textarea
                                            value={sectionDraft?.cta_description || ''}
                                            onChange={e => setSectionDraft({ ...sectionDraft, cta_description: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-md h-24"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Text</label>
                                            <input
                                                type="text"
                                                value={sectionDraft?.cta_button_text || ''}
                                                onChange={e => setSectionDraft({ ...sectionDraft, cta_button_text: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Link</label>
                                            <input
                                                type="text"
                                                value={sectionDraft?.cta_button_link || ''}
                                                onChange={e => setSectionDraft({ ...sectionDraft, cta_button_link: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Secondary CTA Text</label>
                                            <input
                                                type="text"
                                                value={sectionDraft?.secondary_cta_text || ''}
                                                onChange={e => setSectionDraft({ ...sectionDraft, secondary_cta_text: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Secondary CTA Link</label>
                                            <input
                                                type="text"
                                                value={sectionDraft?.secondary_cta_link || ''}
                                                onChange={e => setSectionDraft({ ...sectionDraft, secondary_cta_link: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-6">
                                        <span className="text-sm font-medium text-gray-700">Enable Section</span>
                                        <Toggle checked={(sectionDraft?.is_active ?? 1) === 1} onChange={(c) => setSectionDraft({ ...sectionDraft, is_active: c ? 1 : 0 })} />
                                    </div>
                                </div>
                            )}



                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Section Settings'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Project Management */}
                {activeTab === 'projects' && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Projects List</h2>
                            <button
                                onClick={() => {
                                    setEditingProject('new');
                                    setProjectForm({
                                        title: '',
                                        category: 'Commercial',
                                        location: '',
                                        capacity: '',
                                        system: '',
                                        image: '',
                                        display_order: projects.length + 1,
                                        is_active: true
                                    });
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                            >
                                Add New Project
                            </button>
                        </div>

                        {editingProject && (
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold">{editingProject === 'new' ? 'Add New Project' : 'Edit Project'}</h3>
                                    <button onClick={() => setEditingProject(null)} className="text-gray-500">Cancel</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title</label>
                                            <input
                                                type="text"
                                                value={projectForm.title}
                                                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-md"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                                <select
                                                    value={projectForm.category}
                                                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option>Residential</option>
                                                    <option>Commercial</option>
                                                    <option>Industrial</option>
                                                    <option>Hospitality</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                                                <input
                                                    type="text"
                                                    value={projectForm.location}
                                                    onChange={e => setProjectForm({ ...projectForm, location: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                                                <input
                                                    type="text"
                                                    value={projectForm.capacity}
                                                    onChange={e => setProjectForm({ ...projectForm, capacity: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                    placeholder="e.g. 450 Ton VRF"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System</label>
                                                <input
                                                    type="text"
                                                    value={projectForm.system}
                                                    onChange={e => setProjectForm({ ...projectForm, system: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                    placeholder="e.g. Daikin Inverter"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ImageUploader
                                            value={projectForm.image}
                                            onChange={url => setProjectForm({ ...projectForm, image: url })}
                                            folder="projects"
                                            label="Project Image"
                                            ratio="16:9"
                                        />
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Order</label>
                                                <input
                                                    type="number"
                                                    value={projectForm.display_order}
                                                    onChange={e => setProjectForm({ ...projectForm, display_order: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-4">
                                                <input
                                                    type="checkbox"
                                                    id="p-active"
                                                    checked={projectForm.is_active}
                                                    onChange={e => setProjectForm({ ...projectForm, is_active: e.target.checked })}
                                                />
                                                <label htmlFor="p-active" className="text-sm font-bold text-gray-700">Active</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            onClick={handleSaveProject}
                                            disabled={saving}
                                            className="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Project Info'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 uppercase text-[10px] font-black tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Image</th>
                                        <th className="px-6 py-4">Project</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {projects.map((p) => {
                                        const pId = p.id || (p as any)._id;
                                        return (
                                            <tr key={pId} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden border">
                                                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-800">{p.title}</p>
                                                    <p className="text-xs text-gray-400">{p.system}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">{p.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{p.location}</td>
                                                <td className="px-6 py-4 text-sm font-mono">{p.display_order}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.is_active ? 'Active' : 'Hidden'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            const pWithId = { ...p, id: p.id || (p as any)._id };
                                                            setProjectForm(pWithId);
                                                            setEditingProject(pId);
                                                        }}
                                                        className="text-primary hover:text-primary-800 text-sm font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(pId)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
