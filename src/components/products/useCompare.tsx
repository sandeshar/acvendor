"use client";

import { useState, useEffect } from 'react';

export type CompareItem = {
    id: number;
    slug?: string;
    title?: string;
    thumbnail?: string;
    price?: string;
};

const STORAGE_KEY = 'compare_products';
const MAX_ITEMS = 4;
const EVENT_NAME = 'compare_products_changed';

export default function useCompare() {
    const [items, setItems] = useState<CompareItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch (e) {
            setItems([]);
        }

        // listen for changes from other tabs
        function onStorage(e: StorageEvent) {
            if (e.key !== STORAGE_KEY) return;
            try {
                const raw = e.newValue;
                setItems(raw ? JSON.parse(raw) : []);
            } catch (err) {
                // ignore
            }
        }

        // listen for same-tab updates via CustomEvent
        function onCustom(e: Event) {
            try {
                const detail = (e as any)?.detail;
                if (!Array.isArray(detail)) return;
                setItems(prev => {
                    // avoid unnecessary state updates during render - compare by id membership
                    const same = prev.length === detail.length && detail.every((d: any) => prev.some(p => p.id === d.id));
                    return same ? prev : (detail as CompareItem[]);
                });
            } catch (err) {
                // ignore
            }
        }

        window.addEventListener('storage', onStorage);
        window.addEventListener(EVENT_NAME, onCustom as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(EVENT_NAME, onCustom as EventListener);
        };
    }, []);

    // helper to persist and notify
    function persistAndNotify(next: CompareItem[]) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
            // ignore
        }
        try {
            // Dispatch asynchronously to avoid triggering setState during render of the caller component
            if (typeof queueMicrotask === 'function') {
                queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next })));
            } else {
                setTimeout(() => window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next })), 0);
            }
        } catch (e) {
            // ignore
        }
    }

    function addItem(item: CompareItem) {
        if (!item || !item.id) return;
        setItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            if (prev.length >= MAX_ITEMS) {
                alert(`You can compare up to ${MAX_ITEMS} products`);
                return prev;
            }
            const next = [...prev, item];
            persistAndNotify(next);
            return next;
        });
    }

    function removeItem(id: number) {
        setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            persistAndNotify(next);
            return next;
        });
    }

    function clear() {
        setItems(() => {
            const next: CompareItem[] = [];
            persistAndNotify(next);
            return next;
        });
    }

    function contains(id: number) {
        return items.some(i => i.id === id);
    }

    return { items, addItem, removeItem, clear, contains };
}
