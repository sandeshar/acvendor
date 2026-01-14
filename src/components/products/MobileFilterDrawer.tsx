"use client";

import { useState, useEffect } from 'react';

interface MobileFilterDrawerProps {
    children: React.ReactNode;
}

export default function MobileFilterDrawer({ children }: MobileFilterDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div className="lg:hidden mb-6">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Filters
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[300px] bg-gray-50 z-[101] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                <div className="flex items-center justify-between p-6 border-b bg-white">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {children}
                </div>
                <div className="p-6 border-t bg-white">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
}
