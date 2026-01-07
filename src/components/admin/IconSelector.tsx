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
    'cloud', 'sunny', 'toys', 'energy_savings_leaf', 'smart_toy', 'humidity_mid',
    'apartment', 'build', 'construction', 'electric_bolt', 'faucet', 'fire_extinguisher', 'gas_meter',
    'heat_pump', 'kitchen', 'lightbulb', 'local_fire_department', 'mop', 'plumbing', 'propane',
    'roofing', 'solar_power', 'tools_installation_kit', 'water_damage', 'water_drop', 'wind_power',
    'add', 'remove', 'edit', 'delete', 'save', 'close', 'search', 'menu', 'arrow_back', 'arrow_forward',
    'check', 'warning', 'error', 'help', 'account_circle', 'shopping_cart', 'favorite', 'visibility',
    'visibility_off', 'lock', 'lock_open', 'mail', 'call', 'map', 'navigation', 'work', 'school',
    'science', 'fitness_center', 'celebration', 'restaurant', 'local_shipping', 'payments',
    'contact_support', 'event', 'calendar_today', 'schedule', 'update', 'history', 'launch',
    'open_in_new', 'link', 'attachment', 'content_copy', 'content_paste', 'content_cut', 'undo', 'redo',
    'cloud_upload', 'cloud_download', 'backup', 'refresh', 'sync', 'more_vert', 'more_horiz',
    'expand_more', 'expand_less', 'chevron_right', 'chevron_left', 'first_page', 'last_page',
    'auto_awesome', 'palette', 'image', 'photo_camera', 'videocam', 'mic', 'volume_up', 'play_arrow',
    'pause', 'stop', 'skip_next', 'skip_previous', 'fast_forward', 'fast_rewind', 'playlist_add',
    'filter_list', 'sort', 'view_list', 'view_module', 'view_quilt', 'view_stream', 'view_week',
    'grid_view', 'table_rows', 'apps', 'dashboard', 'category', 'label', 'tag', 'bookmarks',
    'push_pin', 'flag', 'report', 'assignment', 'task_alt', 'notes', 'list_alt', 'description',
    'article', 'feedback'
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
