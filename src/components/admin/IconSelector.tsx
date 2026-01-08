"use client";

import React, { useState } from 'react';

interface IconSelectorProps {
    value?: string;
    onChange: (icon: string) => void;
    className?: string;
}

const COMMON_ICONS = [
    // Essentials & General
    'star', 'favorite', 'visibility', 'visibility_off', 'lock', 'lock_open', 'mail', 'call', 'map', 'navigation',
    'search', 'menu', 'close', 'add', 'remove', 'edit', 'delete', 'save', 'refresh', 'sync',
    'check_circle', 'info', 'warning', 'error', 'help', 'notifications', 'launch', 'open_in_new',

    // Home & Living
    'home', 'chair', 'bed', 'desk', 'meeting_room', 'apartment', 'corporate_fare', 'hotel', 'storefront',
    'kitchen', 'deck', 'shower', 'bathtub', 'local_laundry_service', 'tv', 'weekend', 'outdoor_grill',

    // Business & Places
    'work', 'school', 'science', 'fitness_center', 'celebration', 'restaurant', 'local_cafe', 'fastfood',
    'bakery_dining', 'local_hospital', 'medical_services', 'account_balance', 'business_center',
    'local_shipping', 'payments', 'shopping_cart', 'shopping_basket', 'local_mall', 'store',

    // HVAC & Services
    'ac_unit', 'air', 'eco', 'bolt', 'electric_bolt', 'energy_savings_leaf', 'thermostat', 'humidity_mid',
    'heat_pump', 'wind_power', 'solar_power', 'water_drop', 'water_damage', 'plumbing', 'faucet',
    'gas_meter', 'fire_extinguisher', 'propane', 'roofing',

    // Tools & Tech
    'build', 'construction', 'handyman', 'tools_installation_kit', 'engineering', 'precision_manufacturing',
    'settings', 'settings_suggest', 'support_agent', 'verified_user', 'speed', 'battery_full',
    'dns', 'cloud', 'backup', 'cloud_upload', 'cloud_download', 'wifi', 'smart_toy', 'toys',

    // Navigation & Layout
    'arrow_back', 'arrow_forward', 'chevron_right', 'chevron_left', 'expand_more', 'expand_less',
    'first_page', 'last_page', 'more_vert', 'more_horiz', 'grid_view', 'view_list', 'view_module',
    'dashboard', 'category', 'label', 'tag', 'bookmarks', 'push_pin', 'flag',

    // Content & Data
    'article', 'description', 'notes', 'list_alt', 'assignment', 'task_alt', 'feedback', 'history',
    'calendar_today', 'schedule', 'update', 'event', 'attachment', 'link', 'content_copy', 'content_paste'
];

export default function IconSelector({ value = '', onChange, className = '' }: IconSelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = COMMON_ICONS.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (icon: string) => {
        onChange(icon);
        setOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative inline-block ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all min-w-[120px] ${open ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white'
                    }`}
            >
                <span className="material-symbols-outlined text-[20px] text-indigo-600">{value || 'category'}</span>
                <span className="text-[12px] font-medium text-gray-700 truncate">{value || 'Select Icon'}</span>
                <span className="material-symbols-outlined text-[16px] text-gray-400 ml-auto">expand_more</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearchTerm(''); }}></div>
                    <div className="absolute z-50 left-0 mt-2 w-72 rounded-lg bg-white border border-gray-200 shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
                        <div className="mb-3 relative">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search icons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="material-symbols-outlined absolute left-2 top-2 text-gray-400 text-[18px]">search</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto p-1 bg-gray-50 rounded-md">
                            {filteredIcons.length > 0 ? (
                                filteredIcons.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => handleSelect(icon)}
                                        title={icon}
                                        className={`p-2.0 rounded flex items-center justify-center transition-all ${value === icon ? 'bg-blue-600 text-white shadow-md scale-110 z-10' : 'hover:bg-white hover:text-blue-600 text-gray-500'}`}
                                    >
                                        <span className="material-symbols-outlined text-[24px]">{icon}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-4 py-8 text-center">
                                    <p className="text-sm text-gray-500">No icons found</p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => handleSelect(searchTerm.toLowerCase().replace(/\s+/g, '_'))}
                                            className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                                        >
                                            Use "{searchTerm}" anyway
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
