"use client";

import React, { useState } from 'react';

interface IconSelectorProps {
    value?: string;
    onChange: (icon: string) => void;
    className?: string;
}

const COMMON_ICONS = [
    'wifi', 'eco', 'bolt', 'air', 'ac_unit', 'support_agent', 'handyman', 'verified_user', 'star',
    'home', 'chair', 'bed', 'desk', 'meeting_room', 'battery_full', 'speed', 'thermostat',
    'settings', 'request_quote', 'download', 'menu_book', 'check_circle', 'info', 'notifications',
    'cloud', 'sunny', 'toys', 'energy_savings_leaf', 'smart_toy', 'humidity_mid'
];

export default function IconSelector({ value = '', onChange, className = '' }: IconSelectorProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${open ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px] text-gray-400">{value || 'category'}</span>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">{value || 'Icon'}</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute z-50 left-0 mt-2 w-72 rounded-lg bg-white border border-gray-200 shadow-xl p-4 animate-in fade-in duration-100">
                        <div className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto">
                            {COMMON_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => { onChange(icon); setOpen(false); }}
                                    className={`p-3 rounded transition-all ${value === icon ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                                >
                                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
