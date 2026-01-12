"use client";

import { useState, useEffect } from "react";
import ImageUploader from '@/components/shared/ImageUploader';
import { formatPrice, parsePriceNumber } from '@/utils/formatPrice';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import IconSelector from '@/components/admin/IconSelector';

interface ProductFormProps {
    initialData?: any;
    onSave: (data: any) => Promise<void>;
    saving: boolean;
    title: string;
}

export default function ProductForm({ initialData, onSave, saving, title }: ProductFormProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'media' | 'seo'>('general');
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    // Table border color (default and current selection)
    const [tableBorderColor, setTableBorderColor] = useState<string>('#e5e7eb');
    // Toggle for showing advanced controls (keeps toolbar compact)
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    const [product, setProduct] = useState<any>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        thumbnail: '',
        images: [],
        inventory_status: 'in_stock',
        locations: [],
        price: '',
        compare_at_price: '',
        discount_percent: 0,
        discounted_price: '',
        currency: 'NPR',
        model: '',
        technical: {
            power: '',
            iseer: '',
            refrigerant: '',
            noise: '',
            customSpecs: [], // flexible additional specs (array of { name, value })
        },
        features: [],
        meta_title: '',
        meta_description: '',
        category_id: null,
        subcategory_id: null,
        statusId: 1,
        application_areas: [],
        ...initialData
    });



    const excerptEditor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false }),
            Underline,
            Placeholder.configure({ placeholder: 'Brief description...' }),
        ],
        content: product.excerpt || '',
        editorProps: { attributes: { class: 'tiptap min-h-[100px] p-4 focus:outline-none prose max-w-none text-sm', spellcheck: 'true' } },
        onUpdate: ({ editor }) => setProduct((p: any) => ({ ...p, excerpt: editor.getHTML() })),
        immediatelyRender: false,
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Link.configure({ openOnClick: false }),
            Image,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            TextStyle,
            Color,
            // Table extensions
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({ placeholder: 'Description...' }),
        ],
        content: product.content || '',
        editorProps: { attributes: { class: 'tiptap min-h-[300px] p-4 focus:outline-none prose max-w-none text-sm', spellcheck: 'true' } },
        onUpdate: ({ editor }) => setProduct((p: any) => ({ ...p, content: editor.getHTML() })),
        immediatelyRender: false,
    });

    // Initialize editors with incoming data once editors are available
    useEffect(() => {
        if (!initialData) return;

        const normalizedApplicationAreas = (() => {
            const v = initialData.application_areas;
            if (!v) return [];
            if (typeof v === 'string') {
                try { return JSON.parse(v); } catch (e) { return [v].filter(Boolean); }
            }
            return v;
        })();

        // Merge top-level technical fields into the nested `technical` object so form controls bind correctly
        const parsedCustomSpecs = (() => {
            // Prioritize the prepared array in technical.customSpecs (from EditPage handles)
            if (initialData.technical && Array.isArray(initialData.technical.customSpecs)) {
                return initialData.technical.customSpecs;
            }
            // Fallback to top-level keys
            const v = initialData.customSpecs || initialData.custom_specs;
            if (!v) return [];
            if (Array.isArray(v)) return v;
            if (typeof v === 'string') {
                try { return JSON.parse(v); } catch (e) { return []; }
            }
            return [];
        })();

        const parsedFeatures = (() => {
            // Prioritize the prepared array/value in initialData.features (EditPage overwrites this)
            const v = initialData.features;
            if (Array.isArray(v)) return v;
            // Fallback
            if (typeof v === 'string') {
                try { return JSON.parse(v); } catch (e) { return []; }
            }
            return [];
        })();

        setProduct((prev: any) => ({
            ...prev,
            ...initialData,
            application_areas: normalizedApplicationAreas,
            features: parsedFeatures || [],
            technical: {
                power: initialData.power ?? (initialData.technical?.power ?? prev.technical?.power ?? ''),
                iseer: initialData.iseer ?? (initialData.technical?.iseer ?? prev.technical?.iseer ?? ''),
                refrigerant: initialData.refrigerant ?? (initialData.technical?.refrigerant ?? prev.technical?.refrigerant ?? ''),
                noise: initialData.noise ?? (initialData.technical?.noise ?? prev.technical?.noise ?? ''),
                dimensions: initialData.dimensions ?? (initialData.technical?.dimensions ?? prev.technical?.dimensions ?? ''),
                voltage: initialData.voltage ?? (initialData.technical?.voltage ?? prev.technical?.voltage ?? ''),
                capacity: initialData.capacity ?? (initialData.technical?.capacity ?? prev.technical?.capacity ?? ''),
                warranty: initialData.warranty ?? (initialData.technical?.warranty ?? prev.technical?.warranty ?? ''),
                customSpecs: parsedCustomSpecs.length ? parsedCustomSpecs : (prev.technical?.customSpecs || []),
            }
        }));

        try {
            if (editor && initialData.content) {
                editor.commands.setContent(initialData.content);
            }
        } catch (e) { /* ignore if editor not ready */ }

        try {
            if (excerptEditor && initialData.excerpt) {
                excerptEditor.commands.setContent(initialData.excerpt);
            }
        } catch (e) { /* ignore if excerptEditor not ready */ }
    }, [initialData, editor, excerptEditor]);

    // Sync color input with the table under caret (if any)
    useEffect(() => {
        if (!editor) return;
        const updateColorFromSelection = () => {
            try {
                const attrs = editor.getAttributes('table') || {};
                const style = attrs.style || '';
                const m = style.match(/--table-border-color:\s*([^;]+);?/);
                if (m && m[1]) setTableBorderColor(m[1]);
                // do not override if no style found so default remains
            } catch (e) { /* ignore */ }
        };
        editor.on('selectionUpdate', updateColorFromSelection);
        // run once on mount to capture when editor starts with caret in table
        updateColorFromSelection();
        return () => { editor.off('selectionUpdate', updateColorFromSelection); };
    }, [editor]);

    useEffect(() => {
        fetch('/api/pages/services/categories').then(r => r.json()).then(setCategories).catch(() => { });
        fetch('/api/pages/services/subcategories').then(r => r.json()).then(setSubcategories).catch(() => { });
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: 'description' },
        { id: 'specs', label: 'Specs', icon: 'settings' },
        { id: 'media', label: 'Gallery', icon: 'image' },
        { id: 'seo', label: 'SEO & Price', icon: 'trending_up' },
    ];

    // Track whether the caret is currently inside a table (reactive state)
    const [isInTable, setIsInTable] = useState<boolean>(false);

    const hasTableCommands = !!(editor && (((editor.commands as any)?.insertTable instanceof Function) || ((editor.chain().focus() as any)?.insertTable instanceof Function) || !!(editor.can?.().insertTable)));

    // Log available table-related commands for debugging when editor initializes
    useEffect(() => {
        if (!editor) return;
        try {
            const cmds = Object.keys((editor.commands as any) || {}).filter(k => typeof (editor.commands as any)[k] === 'function');
            if (!cmds.includes('insertTable')) {
                console.warn('Tiptap table commands missing. Available commands:', cmds);
            } else {
                console.log('Tiptap table commands available.');
            }
        } catch (e) { console.warn('Failed to enumerate editor commands', e); }

        // Update initial state
        setIsInTable(!!(editor.isActive('table') || editor.isActive('tableRow') || editor.isActive('tableCell')));

        // Subscribe to selection updates to keep isInTable in sync
        const updateInTable = () => setIsInTable(!!(editor.isActive('table') || editor.isActive('tableRow') || editor.isActive('tableCell')));
        editor.on('selectionUpdate', updateInTable);
        return () => { try { editor.off('selectionUpdate', updateInTable); } catch (e) { /* ignore */ } };
    }, [editor]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Simple Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-900">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    </div>
                    <button
                        onClick={() => onSave(product)}
                        disabled={saving}
                        className="bg-primary hover:bg-primary-800 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-24">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-2 transition-all ${activeTab === tab.id
                                        ? 'bg-primary-50 border-primary text-primary-800'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Form Body */}
                    <main className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-[500px] section">
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                                            <input
                                                value={product.title}
                                                onChange={e => setProduct({ ...product, title: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 outline-none transition-all"
                                                placeholder="e.g. Panasonic 1.5 Ton AC"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">URL Slug</label>
                                            <input
                                                value={product.slug}
                                                onChange={e => setProduct({ ...product, slug: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 outline-none transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Brief Description</label>
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                            <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                                                <button type="button" onClick={() => excerptEditor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${excerptEditor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                                <button type="button" onClick={() => excerptEditor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${excerptEditor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                                                <button type="button" onClick={() => excerptEditor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${excerptEditor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                            </div>
                                            <EditorContent editor={excerptEditor} />
                                        </div>
                                    </div>

                                    {/* <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Availability Label</label>
                                        <input
                                            value={product.availabilityLabel || ''}
                                            onChange={e => setProduct({ ...product, availabilityLabel: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 outline-none transition-all text-sm"
                                            placeholder="e.g. Available for installation in"
                                        />
                                        <p className="text-xs text-gray-400">Optional text shown before the locations list on the product page.</p>
                                    </div> */}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Product Content</label>
                                        <div className="border border-gray-300 rounded-md overflow-hidden">
                                            <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
                                                {/* Primary toolbar: keep minimal icons */}
                                                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Bold"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                                <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Italic"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>

                                                <div className="w-px bg-gray-300 mx-1"></div>

                                                <button type="button" onClick={() => {
                                                    const url = window.prompt('Enter URL:');
                                                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                                                }} className={`p-1.5 rounded ${editor?.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Add Link"><span className="material-symbols-outlined text-[18px]">link</span></button>

                                                <button type="button" onClick={() => {
                                                    const url = window.prompt('Enter Image URL:');
                                                    if (url) editor?.chain().focus().setImage({ src: url }).run();
                                                }} className="p-1.5 rounded hover:bg-gray-100" title="Add Image"><span className="material-symbols-outlined text-[18px]">image</span></button>

                                                <button type="button" onClick={() => {
                                                    const rows = parseInt(window.prompt('Rows', '3') || '3');
                                                    const cols = parseInt(window.prompt('Columns', '3') || '3');
                                                    const header = window.confirm('Include header row?');
                                                    if (!editor) return;
                                                    if (!(editor as any).can?.().insertTable && typeof (editor.chain().focus() as any).insertTable !== 'function') {
                                                        alert('Table commands are not available — check table extensions.');
                                                        return;
                                                    }
                                                    try {
                                                        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();
                                                        // After insertion, apply the currently selected border color
                                                        if (tableBorderColor) {
                                                            // give ProseMirror a tick to place caret inside table
                                                            setTimeout(() => {
                                                                try {
                                                                    editor.chain().focus().updateAttributes('table', { style: `--table-border-color: ${tableBorderColor};` }).run();
                                                                } catch (e) { console.warn('Could not set table border color', e); }
                                                            }, 10);
                                                        }
                                                    } catch (e) { console.warn('insertTable failed', e); alert('Failed to insert table'); }
                                                }} className={`p-1.5 rounded ${isInTable ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Insert Table"><span className="material-symbols-outlined text-[18px]">table_chart</span></button>

                                                <div className="flex-1"></div>

                                                <button type="button" onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Align Left"><span className="material-symbols-outlined text-[18px]">format_align_left</span></button>
                                                <button type="button" onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Align Center"><span className="material-symbols-outlined text-[18px]">format_align_center</span></button>
                                                <button type="button" onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Align Right"><span className="material-symbols-outlined text-[18px]">format_align_right</span></button>

                                                <button type="button" onClick={() => setShowAdvanced(s => !s)} className="p-1.5 rounded hover:bg-gray-100" title="More"><span className="material-symbols-outlined text-[18px]">more_horiz</span></button>

                                            </div>

                                            {showAdvanced && (
                                                <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 mt-2">
                                                    <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor?.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Underline"><span className="material-symbols-outlined text-[18px]">format_underlined</span></button>

                                                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="H2"><span className="material-symbols-outlined text-[18px]">looks_two</span></button>
                                                    <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="H3"><span className="material-symbols-outlined text-[18px]">looks_3</span></button>

                                                    <div className="w-px bg-gray-300 mx-1"></div>

                                                    <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Bullet List"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                                                    <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`} title="Ordered List"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>

                                                    <div className="w-px bg-gray-300 mx-1"></div>

                                                    <button type="button" onClick={() => { if (!isInTable || !editor) { alert('Place the caret inside a table to add a row.'); return; } try { editor.chain().focus().addRowAfter().run(); } catch (e) { console.warn(e); alert('Failed to add row'); } }} disabled={!isInTable} className={`p-1.5 rounded ${isInTable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} title="Add Row"><span className="material-symbols-outlined text-[18px]">table_rows</span></button>

                                                    {/* Border color picker */}
                                                    <div className="flex items-center gap-2 px-2">
                                                        <input type="color" value={tableBorderColor} onChange={(e) => setTableBorderColor((e.target as HTMLInputElement).value)} className="w-8 h-8 p-1 rounded cursor-pointer border" title="Table border color" />
                                                        <button type="button" onClick={() => {
                                                            if (!editor) return;
                                                            if (isInTable) {
                                                                try { editor.chain().focus().updateAttributes('table', { style: `--table-border-color: ${tableBorderColor};` }).run(); alert('Applied color to table'); } catch (e) { console.warn(e); alert('Failed to apply color to table'); }
                                                            } else {
                                                                alert('No table selected — this color will be applied to newly inserted tables.');
                                                            }
                                                        }} className="p-1 text-xs rounded hover:bg-gray-100">Apply</button>
                                                    </div>

                                                    <button type="button" onClick={() => { if (!isInTable || !editor) { alert('Place the caret inside a table to delete a row.'); return; } try { editor.chain().focus().deleteRow().run(); } catch (e) { console.warn(e); alert('Failed to delete row'); } }} disabled={!isInTable} className={`p-1.5 rounded ${isInTable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} title="Delete Row"><span className="material-symbols-outlined text-[18px]">remove</span></button>

                                                    <button type="button" onClick={() => { if (!isInTable || !editor) { alert('Place the caret inside a table to add a column.'); return; } try { editor.chain().focus().addColumnAfter().run(); } catch (e) { console.warn(e); alert('Failed to add column'); } }} disabled={!isInTable} className={`p-1.5 rounded ${isInTable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} title="Add Column"><span className="material-symbols-outlined text-[18px]">view_column</span></button>

                                                    <button type="button" onClick={() => { if (!isInTable || !editor) { alert('Place the caret inside a table to delete a column.'); return; } try { editor.chain().focus().deleteColumn().run(); } catch (e) { console.warn(e); alert('Failed to delete column'); } }} disabled={!isInTable} className={`p-1.5 rounded ${isInTable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} title="Delete Column"><span className="material-symbols-outlined text-[18px]">remove</span></button>

                                                    <button type="button" onClick={() => { if (!isInTable || !editor) { alert('Place the caret inside a table to delete it.'); return; } try { editor.chain().focus().deleteTable().run(); } catch (e) { console.warn(e); alert('Failed to delete table'); } }} disabled={!isInTable} className={`p-1.5 rounded ${isInTable ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`} title="Delete Table"><span className="material-symbols-outlined text-[18px]">delete</span></button>

                                                </div>
                                            )}

                                            {!hasTableCommands && (
                                                <div className="text-xs text-yellow-700 p-2 border border-yellow-100 rounded mt-2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                                    <div>Table commands are not available — check table extensions.</div>
                                                    <button onClick={() => { console.log('Editor debug:', editor); console.log('Available commands:', Object.keys((editor?.commands as any || {})).filter(k => typeof (editor?.commands as any)[k] === 'function')); alert('Logged editor debug to console'); }} className="ml-auto underline text-xs">Log debug info</button>
                                                </div>
                                            )}

                                            <EditorContent editor={editor} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specs' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Model</label>
                                            <input value={product.model} onChange={e => setProduct({ ...product, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                            <select value={product.category_id ?? ''} onChange={e => setProduct({ ...product, category_id: e.target.value || null, subcategory_id: null })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Subcategory</label>
                                            <select value={product.subcategory_id ?? ''} onChange={e => setProduct({ ...product, subcategory_id: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium">
                                                <option value="">Select Subcategory</option>
                                                {subcategories.filter((s: any) => s.category_id === product.category_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase">Technical Specs</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Power</label><input value={product.technical?.power || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, power: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">ISEER</label><input value={product.technical?.iseer || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, iseer: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Capacity</label><input value={product.technical?.capacity || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, capacity: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Refrigerant</label><input value={product.technical?.refrigerant || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, refrigerant: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Noise Level</label><input value={product.technical?.noise || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, noise: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Dimensions</label><input value={product.technical?.dimensions || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, dimensions: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Voltage</label><input value={product.technical?.voltage || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, voltage: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Warranty</label><input value={product.technical?.warranty || ''} onChange={e => setProduct({ ...product, technical: { ...product.technical, warranty: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                            </div>

                                            {/* Custom technical specs */}
                                            <div className="pt-4">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase">Custom Specs</h3>
                                                <div className="space-y-2 mt-3">
                                                    {(product.technical?.customSpecs || []).map((spec: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <input
                                                                value={spec.name || ''}
                                                                onChange={(e) => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).map((s: any, i: number) => i === idx ? { ...s, name: e.target.value } : s) } })}
                                                                placeholder="Spec name"
                                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-1/3"
                                                            />
                                                            <input
                                                                value={spec.value || ''}
                                                                onChange={(e) => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).map((s: any, i: number) => i === idx ? { ...s, value: e.target.value } : s) } })}
                                                                placeholder="Spec value"
                                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1"
                                                            />
                                                            <button onClick={() => setProduct({ ...product, technical: { ...product.technical, customSpecs: (product.technical?.customSpecs || []).filter((_: any, i: number) => i !== idx) } })} className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                        </div>
                                                    ))}

                                                    <button onClick={() => setProduct({ ...product, technical: { ...product.technical, customSpecs: [...(product.technical?.customSpecs || []), { name: '', value: '' }] } })} className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase">+ Add Item</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase">Key Features</h3>
                                            <div className="space-y-2">
                                                {(product.features || []).map((f: any, idx: number) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <IconSelector value={f.icon || ''} onChange={(v) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, icon: v } : x) })} />
                                                        <input value={f.label || ''} onChange={(e) => setProduct({ ...product, features: product.features.map((x: any, i: number) => i === idx ? { ...x, label: e.target.value } : x) })} className="flex-1 px-3 py-2 bg-gray-50 border-none outline-none text-sm font-medium rounded-md" />
                                                        <button onClick={() => setProduct({ ...product, features: (product.features || []).filter((_: any, i: number) => i !== idx) })} className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => setProduct({ ...product, features: [...(product.features || []), { icon: 'star', label: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase">+ Add Item</button>
                                            </div>
                                            <div className="pt-6">
                                                <h3 className="text-xs font-bold text-gray-900 uppercase">Best Fit For</h3>
                                                <div className="space-y-3 mt-3">
                                                    {(product.application_areas || []).map((a: any, idx: number) => {
                                                        const item = typeof a === 'string' ? { icon: 'home', label: a } : a;
                                                        return (
                                                            <div key={idx} className="flex gap-3 items-center p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                                                                <IconSelector
                                                                    value={item.icon || 'home'}
                                                                    onChange={(v) => setProduct({
                                                                        ...product,
                                                                        application_areas: (product.application_areas || []).map((x: any, i: number) => i === idx ? { ...item, icon: v } : (typeof x === 'string' ? { icon: 'home', label: x } : x))
                                                                    })}
                                                                />
                                                                <input
                                                                    value={item.label || ''}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        application_areas: (product.application_areas || []).map((x: any, i: number) => i === idx ? { ...item, label: e.target.value } : (typeof x === 'string' ? { icon: 'home', label: x } : x))
                                                                    })}
                                                                    placeholder="e.g. Home, Office"
                                                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-1 focus:ring-primary-500 outline-none"
                                                                />
                                                                <button onClick={() => setProduct({ ...product, application_areas: (product.application_areas || []).filter((_: any, i: number) => i !== idx) })} className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                                            </div>
                                                        );
                                                    })}
                                                    <button onClick={() => setProduct({ ...product, application_areas: [...(product.application_areas || []), { icon: 'home', label: '' }] })} className="w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase">+ Add Item</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase">Thumbnail</label>
                                        <div className="max-w-xs"><ImageUploader label="" folder="products" value={product.thumbnail || ''} onChange={(v) => setProduct({ ...product, thumbnail: v })} ratio="4:3" /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase">Image Gallery</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {(product.images || []).map((img: string, idx: number) => (
                                                <div key={idx} className="group relative aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button onClick={() => setProduct({ ...product, images: (product.images || []).filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 bg-white/80 rounded p-1 shadow invisible group-hover:visible"><span className="material-symbols-outlined text-red-600 text-[18px]">delete</span></button>
                                                </div>
                                            ))}
                                            <div className="aspect-square rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                <ImageUploader label="" folder="products" value={''} onChange={(v) => setProduct({ ...product, images: [...(product.images || []), v] })} buttonText="Upload" ratio="4:3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seo' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b pb-2">Pricing</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Selling Price</label><input value={product.price || ''} onChange={e => setProduct({ ...product, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-md font-bold" /></div>
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Original MRP</label><input value={product.compare_at_price || ''} onChange={e => {
                                                    const val = e.target.value;
                                                    const disc = Number(product.discount_percent || 0);
                                                    const parsed = val === '' ? '' : Number(val);
                                                    if (parsed !== '' && !isNaN(parsed) && disc > 0) {
                                                        const newPrice = Number((parsed * (1 - (disc / 100))).toFixed(2));
                                                        setProduct({ ...product, compare_at_price: val, discounted_price: String(newPrice), price: String(newPrice) });
                                                    } else {
                                                        setProduct({ ...product, compare_at_price: val, discounted_price: '', });
                                                    }
                                                }} className="w-full px-4 py-2 border border-gray-300 rounded-md" /></div>
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Discount (%)</label><input type="number" min={0} max={100} value={product.discount_percent ?? 0} onChange={e => {
                                                    const val = Number(e.target.value || 0);
                                                    const base = Number(product.compare_at_price || 0);
                                                    if (base && val > 0) {
                                                        const newPrice = Number((base * (1 - (val / 100))).toFixed(2));
                                                        setProduct({ ...product, discount_percent: val, discounted_price: String(newPrice), price: String(newPrice) });
                                                    } else {
                                                        setProduct({ ...product, discount_percent: val, discounted_price: '' });
                                                    }
                                                }} className="w-full px-4 py-2 border border-gray-300 rounded-md" /></div>
                                            </div>

                                            {/* Discount preview */}
                                            {(product.compare_at_price && product.discount_percent && Number(product.discount_percent) > 0) ? (
                                                <div className="mt-3 px-3 py-2 bg-green-50 border border-green-100 rounded text-sm text-green-700 flex items-center gap-4">
                                                    <div className="font-bold">New Price: NPR {formatPrice(product.price)}</div>
                                                    <div className="text-sm">You save NPR {formatPrice((Number(product.compare_at_price || 0) - Number(product.price || 0)) || 0)} ({Number(product.discount_percent)}% off)</div>
                                                </div>
                                            ) : null}
                                            <div className="pt-4 flex gap-3">
                                                <button onClick={() => setProduct({ ...product, statusId: 1 })} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${product.statusId === 1 ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>Public</button>
                                                <button onClick={() => setProduct({ ...product, statusId: 2 })} className={`flex-1 py-2 text-xs font-bold uppercase rounded border ${product.statusId === 2 ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>Draft</button>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b pb-2">SEO Meta Tags</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Meta Title</label><input value={product.meta_title} onChange={e => setProduct({ ...product, meta_title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium" /></div>
                                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Meta Description</label><textarea value={product.meta_description} onChange={e => setProduct({ ...product, meta_description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium resize-none" rows={4} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
