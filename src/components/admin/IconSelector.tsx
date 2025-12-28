"use client";

import React, { useState } from 'react';

interface IconSelectorProps {
    value?: string;
    onChange: (icon: string) => void;
    className?: string;
}

const COMMON_ICONS = [
    'wifi', 'eco', 'bolt', 'air', 'ac_unit', 'support_agent', 'handyman', 'verified_user', 'star', 'home', 'chair', 'bed', 'desk', 'meeting_room', 'battery_full', 'speed', 'thermostat', 'settings', 'request_quote', 'download', 'menu_book'
];

export default function IconSelector({ value = '', onChange, className = '' }: IconSelectorProps) {
    const [open, setOpen] = useState(false);

    const filtered = COMMON_ICONS; // removed search per request

    return (
        <div className={`relative inline-block ${className}`}>
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm">
                    {value ? <span className="material-symbols-outlined text-[22px]">{value}</span> : <span className="text-sm text-gray-500">icon</span>}
                    <span className="text-sm text-gray-700">{value || 'Select'}</span>
                </button>
            </div>

            {open && (
                <div className="absolute z-50 left-0 mt-2 w-96 rounded-lg bg-white border border-gray-200 shadow-lg p-4">
                    <div className="grid grid-cols-5 gap-3 max-h-72 overflow-auto">
                        {filtered.map((icon) => (
                            <button key={icon} onClick={() => { onChange(icon); setOpen(false); }} title={icon} className="flex flex-col items-center gap-1 p-3 rounded hover:bg-gray-100 text-center">
                                <span className="material-symbols-outlined text-[34px]">{icon}</span>
                                <span className="text-xs text-gray-600 truncate max-w-[110px]">{icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
