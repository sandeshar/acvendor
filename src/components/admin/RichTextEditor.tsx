"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { showToast } from '@/components/Toast';

interface RichTextEditorProps {
    value: string;
    onChange: (v: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
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
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    const [activeStates, setActiveStates] = useState({
        bold: false,
        italic: false,
        underline: false,
        h1: false,
        h2: false,
        h3: false,
        bulletList: false,
        orderedList: false,
        link: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false,
    });

    useEffect(() => {
        if (!editor) return;
        const updateActive = () => setActiveStates({
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            h1: editor.isActive('heading', { level: 1 }),
            h2: editor.isActive('heading', { level: 2 }),
            h3: editor.isActive('heading', { level: 3 }),
            bulletList: editor.isActive('bulletList'),
            orderedList: editor.isActive('orderedList'),
            link: editor.isActive('link'),
            alignLeft: editor.isActive({ textAlign: 'left' }),
            alignCenter: editor.isActive({ textAlign: 'center' }),
            alignRight: editor.isActive({ textAlign: 'right' }),
            alignJustify: editor.isActive({ textAlign: 'justify' }),
        });
        updateActive();
        editor.on('selectionUpdate', updateActive);
        editor.on('transaction', updateActive);
        editor.on('update', updateActive);
        return () => {
            editor.off('selectionUpdate', updateActive);
            editor.off('transaction', updateActive);
            editor.off('update', updateActive);
        };
    }, [editor]);

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

    const addImageFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const loadingImg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><text x="10" y="40">Uploading...</text></svg>';
            try {
                editor.chain().focus().setImage({ src: loadingImg }).run();

                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'services/content');

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();

                const loadingSrc = loadingImg;
                let foundPos: number | null = null;
                editor.state.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === loadingSrc) {
                        foundPos = pos;
                        return false; 
                    }
                    return true;
                });

                if (foundPos !== null) {
                    editor.chain().focus().setNodeSelection(foundPos).updateAttributes('image', { src: data.url }).run();
                } else {
                    editor.chain().focus().setImage({ src: data.url }).run();
                }
            } catch (err) {
                console.error('Error uploading image:', err);
                showToast('Failed to upload image. Please try again.', { type: 'error' });
                try {
                    const loadingSrcErr = loadingImg;
                    let foundPosErr: number | null = null;
                    editor.state.doc.descendants((node, pos) => {
                        if (node.type.name === 'image' && node.attrs.src === loadingSrcErr) {
                            foundPosErr = pos;
                            return false;
                        }
                        return true;
                    });
                    if (foundPosErr !== null) {
                        editor.chain().focus().setNodeSelection(foundPosErr).deleteSelection().run();
                    } else {
                        editor.commands.deleteSelection();
                    }
                } catch (e) {}
            }
        }
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-300 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.bold ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.italic ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.underline ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                </button>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.h1 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">looks_one</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.h2 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">looks_two</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.h3 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">looks_3</span>
                </button>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.bulletList ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.orderedList ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                </button>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addLink(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.link ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">link</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); imageInputRef.current?.click(); }}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">file_upload</span>
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={addImageFromFile} className="hidden" />
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
                    className="p-2 rounded text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">redo</span>
                </button>

                {/* Alignment buttons */}
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.alignLeft ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.alignCenter ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.alignRight ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${activeStates.alignJustify ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">format_align_justify</span>
                </button>
            </div>
            <div className="prose prose-sm max-w-none p-3 focus:outline-none min-h-64 bg-white">
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none [&_.ProseMirror]:min-h-64 [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-0"
                />
            </div>
        </div>
    );
}
