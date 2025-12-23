"use client";

import { useCallback, useRef, useState } from "react";

export default function ImageUploader({
    label,
    value,
    onChange,
    folder,
    accept = "image/*",
    buttonText = "Choose image"
}: {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    folder: string;
    accept?: string;
    buttonText?: string;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const openPicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const resetState = () => {
        setError(null);
        setProgress(0);
    };

    const handleUpload = async (file: File) => {
        resetState();
        setUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            form.append("folder", folder);

            const url = await uploadWithProgress("/api/upload", form, (percent) => setProgress(percent));
            if (url) onChange(url);
        } catch (e: any) {
            setError(e?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const onFiles = async (files?: FileList | null) => {
        if (!files || files.length === 0) return;
        await handleUpload(files[0]); // single image use-case
    };

    const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await handleUpload(files[0]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

            {value ? (
                <div className="flex items-center gap-3 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="preview" className="h-16 w-16 rounded object-cover border" />
                    <button
                        type="button"
                        className="text-sm text-red-600 hover:text-red-700"
                        onClick={() => onChange("")}
                        disabled={uploading}
                    >
                        Remove
                    </button>
                </div>
            ) : null}

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`relative rounded-lg border ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"} transition-colors`}
            >
                <div className="flex items-center justify-between gap-3 p-3">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Drag & drop</span> an image here, or
                        <button
                            type="button"
                            onClick={openPicker}
                            className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium"
                            disabled={uploading}
                        >
                            browse
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={openPicker}
                        className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-black/90 disabled:opacity-50"
                        disabled={uploading}
                    >
                        {buttonText}
                    </button>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => onFiles(e.target.files)}
                    disabled={uploading}
                />
                {uploading ? (
                    <div className="px-3 pb-3">
                        <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                            <div className="h-2 bg-indigo-600 transition-all" style={{ width: `${Math.max(5, progress)}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-gray-600">Uploading {Math.round(progress)}%</div>
                    </div>
                ) : null}
            </div>

            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {value && <p className="text-xs text-gray-500 mt-1 break-all">{value}</p>}
        </div>
    );
}

async function uploadWithProgress(url: string, form: FormData, onProgress: (percent: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    onProgress(percent);
                }
            };

            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    try {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            const data = JSON.parse(xhr.responseText || "{}");
                            const result = data?.url || (Array.isArray(data?.urls) ? data.urls[0] : "");
                            resolve(result);
                        } else {
                            const data = JSON.parse(xhr.responseText || "{}");
                            reject(new Error(data?.error || `Upload failed (${xhr.status})`));
                        }
                    } catch (e: any) {
                        reject(new Error(e?.message || "Upload failed"));
                    }
                }
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));

            xhr.send(form);
        } catch (e: any) {
            reject(new Error(e?.message || "Upload failed"));
        }
    });
}
