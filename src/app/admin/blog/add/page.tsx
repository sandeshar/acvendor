"use client";

import { useState, useRef, useEffect } from "react";
import ImageUploader from "@/components/shared/ImageUploader";
import { showToast } from '@/components/Toast';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import nextDynamic from "next/dynamic";

const lowlight = createLowlight(common);

export const dynamic = 'force-dynamic';

function AddBlogPage() {
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        tags: "",
        metaTitle: "",
        metaDescription: "",
    });
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Small local state to force re-render after running editor commands so toolbar active state updates immediately
    const [, setEditorTick] = useState(0);
    const exec = (fn: () => void) => { fn(); setEditorTick((t) => t + 1); };

    // Keyboard shortcut handler moved below after editor initialization to avoid referencing `editor` before it's defined.


    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg",
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'highlight',
                },
            }),
            TextStyle,
            Color,
            Placeholder.configure({
                placeholder: 'Start writing your amazing content here... Use the toolbar above to format your text.',
                emptyEditorClass: 'is-editor-empty',
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: "<p></p>",
        editorProps: {
            attributes: {
                class: "tiptap min-h-[400px] max-h-[600px] p-4 focus:outline-none overflow-y-auto",
                spellcheck: "true",
            },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
            setCharCount(text.length);
        },
        immediatelyRender: true,
    });

    // Keyboard shortcuts for editor (when editor has focus)
    // Common shortcuts: Bold (Ctrl/Cmd+B), Italic (Ctrl/Cmd+I), Underline (Ctrl/Cmd+U), Strike (Ctrl/Cmd+Shift+S),
    // Undo (Ctrl/Cmd+Z), Redo (Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z), Bullet List (Ctrl/Cmd+Shift+8), Ordered List (Ctrl/Cmd+Shift+7)
    useEffect(() => {
        if (!editor) return;
        const handler = (e: KeyboardEvent) => {
            // Ensure editor is focused and mounted before running shortcuts
            const ed: any = editor;
            const isFocused = typeof ed?.isFocused === 'function' ? ed.isFocused() : Boolean(ed?.isFocused);
            if (!isFocused) return;
            const mod = e.ctrlKey || e.metaKey;
            if (!mod) return;
            const key = e.key.toLowerCase();

            if (key === 'b') { e.preventDefault(); exec(() => editor.chain().focus().toggleBold().run()); }
            else if (key === 'i') { e.preventDefault(); exec(() => editor.chain().focus().toggleItalic().run()); }
            else if (key === 'u') { e.preventDefault(); exec(() => editor.chain().focus().toggleUnderline().run()); }
            else if (key === 'z') { e.preventDefault(); if (e.shiftKey) exec(() => editor.chain().focus().redo().run()); else exec(() => editor.chain().focus().undo().run()); }
            else if (key === 'y') { e.preventDefault(); exec(() => editor.chain().focus().redo().run()); }
            else if (e.shiftKey && key === '8') { e.preventDefault(); exec(() => editor.chain().focus().toggleBulletList().run()); }
            else if (e.shiftKey && key === '7') { e.preventDefault(); exec(() => editor.chain().focus().toggleOrderedList().run()); }
        };

        document.addEventListener('keydown', handler as any);
        return () => document.removeEventListener('keydown', handler as any);
    }, [editor]);

    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();
        setIsSaving(true);
        const content = editor?.getHTML() || "";

        try {
            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    content,
                    tags: formData.tags,
                    thumbnail: thumbnailUrl || null,
                    metaTitle: formData.metaTitle || formData.title,
                    metaDescription: formData.metaDescription,
                    status: isDraft ? 'draft' : 'published'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create post');
            }

            showToast(isDraft ? 'Draft saved successfully!' : 'Post published successfully!', { type: 'success' });
            window.location.href = '/admin/products';
        } catch (error: any) {
            console.error('Error creating post:', error);
            showToast(error.message || 'Failed to create post. Please try again.', { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Thumbnail upload handled by shared ImageUploader

    const setLink = () => {
        const url = prompt("Enter link URL:");
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = prompt("Enter image URL:");
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
    };

    const addImageFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const loadingImg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">Uploading...</text></svg>';
            try {
                // Show loading state
                editor?.chain().focus().setImage({ src: loadingImg }).run();

                // Upload the image
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products/content');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();

                // Replace any image node using the temporary loading image with the uploaded image URL.
                const loadingSrc = loadingImg;
                let foundPos: number | null = null;
                editor?.state.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === loadingSrc) {
                        foundPos = pos;
                        return false;
                    }
                    return true;
                });

                if (foundPos !== null) {
                    editor?.chain().focus().setNodeSelection(foundPos).updateAttributes('image', { src: data.url }).run();
                } else {
                    editor?.chain().focus().setImage({ src: data.url }).run();
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                showToast('Failed to upload image. Please try again.', { type: 'error' });
                // Attempt to remove any temporary loading image node
                try {
                    const loadingSrcErr = loadingImg;
                    let foundPosErr: number | null = null;
                    editor?.state.doc.descendants((node, pos) => {
                        if (node.type.name === 'image' && node.attrs.src === loadingSrcErr) {
                            foundPosErr = pos;
                            return false;
                        }
                        return true;
                    });
                    if (foundPosErr !== null) {
                        editor?.chain().focus().setNodeSelection(foundPosErr).deleteSelection().run();
                    } else {
                        editor?.commands.deleteSelection();
                    }
                } catch (e) {
                    // ignore cleanup errors
                }
            }
        }

        // Reset the input
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    return (
        <main className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Add New Post</h1>
                        <p className="text-slate-500 mt-1">Create a new blog post with rich content and images.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                                        Post Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 text-lg border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Enter an engaging title..."
                                        maxLength={120}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.title.length}/120 characters</p>
                                </div>

                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">
                                        URL Slug
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">/products/</span>
                                        <input
                                            type="text"
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="url-friendly-slug"
                                            pattern="[a-z0-9-]+"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="metaTitle" className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Title (SEO)
                                    </label>
                                    <input
                                        type="text"
                                        id="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Leave empty to use post title"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.metaTitle.length}/60 characters (optimal for search engines)</p>
                                </div>

                                <div>
                                    <label htmlFor="metaDescription" className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Description (SEO)
                                    </label>
                                    <textarea
                                        id="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="Brief description for search results"
                                        rows={3}
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.metaDescription.length}/160 characters (optimal for search engines)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                                    {editor && (
                                        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
                                            {/* Toolbar */}
                                            <div className="bg-slate-50 border-b border-slate-300 p-2 flex items-center gap-1 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleBold().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("bold") ? "bg-slate-200" : ""}`}
                                                    title="Bold (Ctrl/Cmd+B)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_bold</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleItalic().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("italic") ? "bg-slate-200" : ""}`}
                                                    title="Italic (Ctrl/Cmd+I)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_italic</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleUnderline().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("underline") ? "bg-slate-200" : ""}`}
                                                    title="Underline (Ctrl/Cmd+U)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_underlined</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleStrike().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("strike") ? "bg-slate-200" : ""}`}
                                                    title="Strikethrough (Ctrl/Cmd+Shift+S)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">strikethrough_s</span>
                                                </button>
                                                <div className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run())}
                                                        className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("highlight") ? "bg-slate-200" : ""}`}
                                                        title="Highlight"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">highlighter_size_2</span>
                                                    </button>
                                                    <div className="hidden group-hover:flex absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-2 gap-1 z-10">
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run())}
                                                            className="w-6 h-6 rounded bg-yellow-200 hover:ring-2 ring-slate-400"
                                                            title="Yellow"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run())}
                                                            className="w-6 h-6 rounded bg-blue-200 hover:ring-2 ring-slate-400"
                                                            title="Blue"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run())}
                                                            className="w-6 h-6 rounded bg-green-200 hover:ring-2 ring-slate-400"
                                                            title="Green"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#fecaca' }).run())}
                                                            className="w-6 h-6 rounded bg-red-200 hover:ring-2 ring-slate-400"
                                                            title="Red"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().toggleHighlight({ color: '#e9d5ff' }).run())}
                                                            className="w-6 h-6 rounded bg-purple-200 hover:ring-2 ring-slate-400"
                                                            title="Purple"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => exec(() => editor.chain().focus().unsetHighlight().run())}
                                                            className="w-6 h-6 rounded bg-slate-100 hover:ring-2 ring-slate-400 flex items-center justify-center"
                                                            title="Remove"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <select
                                                    onChange={(e) => {
                                                        const level = parseInt(e.target.value);
                                                        if (level === 0) {
                                                            exec(() => editor.chain().focus().setParagraph().run());
                                                        } else {
                                                            exec(() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run());
                                                        }
                                                    }}
                                                    className="px-2 py-1 border border-slate-300 rounded text-sm hover:bg-slate-100"
                                                    title="Text Style"
                                                >
                                                    <option value="0">Paragraph</option>
                                                    <option value="1">Heading 1</option>
                                                    <option value="2">Heading 2</option>
                                                    <option value="3">Heading 3</option>
                                                </select>
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleBulletList().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("bulletList") ? "bg-slate-200" : ""}`}
                                                    title="Bullet List (Ctrl/Cmd+Shift+8)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleOrderedList().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("orderedList") ? "bg-slate-200" : ""}`}
                                                    title="Numbered List (Ctrl/Cmd+Shift+7)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_list_numbered</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleBlockquote().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("blockquote") ? "bg-slate-200" : ""}`}
                                                    title="Quote"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_quote</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().toggleCodeBlock().run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("codeBlock") ? "bg-slate-200" : ""}`}
                                                    title="Code Block"
                                                >
                                                    <span className="material-symbols-outlined text-lg">code</span>
                                                </button>
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().setTextAlign("left").run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: "left" }) ? "bg-slate-200" : ""}`}
                                                    title="Align Left"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_align_left</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().setTextAlign("center").run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: "center" }) ? "bg-slate-200" : ""}`}
                                                    title="Align Center"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_align_center</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().setTextAlign("right").run())}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: "right" }) ? "bg-slate-200" : ""}`}
                                                    title="Align Right"
                                                >
                                                    <span className="material-symbols-outlined text-lg">format_align_right</span>
                                                </button>
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={setLink}
                                                    className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive("link") ? "bg-slate-200" : ""}`}
                                                    title="Insert Link"
                                                >
                                                    <span className="material-symbols-outlined text-lg">link</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().unsetLink().run())}
                                                    disabled={!editor.isActive("link")}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                                                    title="Remove Link"
                                                >
                                                    <span className="material-symbols-outlined text-lg">link_off</span>
                                                </button>
                                                <input
                                                    ref={imageInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={addImageFromFile}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => imageInputRef.current?.click()}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                                                    title="Insert Image"
                                                >
                                                    <span className="material-symbols-outlined text-lg">image</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={addImage}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                                                    title="Insert Image URL"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                                                </button>
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <input
                                                    type="color"
                                                    onChange={(e) => exec(() => editor.chain().focus().setColor(e.target.value).run())}
                                                    value={editor.getAttributes("textStyle").color || "#000000"}
                                                    className="w-8 h-8 border-0 rounded cursor-pointer"
                                                    title="Text Color"
                                                />
                                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().setHorizontalRule().run())}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                                                    title="Horizontal Line"
                                                >
                                                    <span className="material-symbols-outlined text-lg">horizontal_rule</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().undo().run())}
                                                    disabled={!editor.can().undo()}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                                                    title="Undo (Ctrl/Cmd+Z)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">undo</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => exec(() => editor.chain().focus().redo().run())}
                                                    disabled={!editor.can().redo()}
                                                    className="p-2 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                                                    title="Redo (Ctrl/Cmd+Y / Shift+Ctrl/Cmd+Z)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">redo</span>
                                                </button>
                                            </div>
                                            {/* Editor */}
                                            <EditorContent editor={editor} />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-slate-500">Use the toolbar to format your content with headings, lists, and links</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>{wordCount} words</span>
                                            <span>{charCount} characters</span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                Reading time: {Math.max(1, Math.ceil(wordCount / 200))} min
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="react, nextjs, tailwind, design"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Comma-separated list of tags for better discoverability</p>
                                </div>

                                <div>
                                    <ImageUploader
                                        label="Thumbnail Image"
                                        value={thumbnailUrl}
                                        onChange={setThumbnailUrl}
                                        folder="blog/thumbnails"
                                        buttonText="Upload thumbnail"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB (recommended: 1200x630px)</p>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-lg">
                                <div className="flex items-center gap-2">
                                    {isSaving && (
                                        <span className="flex items-center gap-2 text-sm text-slate-600">
                                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-primary"
                                        disabled={isSaving || !formData.title || !formData.slug || wordCount === 0}
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, false)}
                                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSaving || !formData.title || !formData.slug || wordCount === 0}
                                    >
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        {isSaving ? "Publishing..." : "Publish Post"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default nextDynamic(() => Promise.resolve(AddBlogPage), { ssr: false });
