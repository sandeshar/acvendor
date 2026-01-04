"use client";

import { useState, useEffect } from 'react';

export type CompareItem = {
    id?: string | number;
    _id?: string;
    slug?: string;
    title?: string;
    thumbnail?: string;
    price?: string;
};

const STORAGE_KEY = 'compare_products';
const MAX_ITEMS = 4;
const EVENT_NAME = 'compare_products_changed';

const getId = (item: any) => String(item?._id ?? item?.id ?? '');

export default function useCompare() {
    const [items, setItems] = useState<CompareItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as CompareItem[];
                const normalized = parsed.map(p => ({ ...p, id: getId(p) }));
                setItems(normalized);
            }
        } catch (e) {
            setItems([]);
        }

        // listen for changes from other tabs
        function onStorage(e: StorageEvent) {
            if (e.key !== STORAGE_KEY) return;
            try {
                const raw = e.newValue;
                const parsed = raw ? JSON.parse(raw) : [];
                const normalized = parsed.map((p: any) => ({ ...p, id: getId(p) }));
                setItems(normalized);
            } catch (err) {
                // ignore
            }
        }

        // listen for same-tab updates via CustomEvent
        function onCustom(e: Event) {
            try {
                const detail = (e as any)?.detail;
                if (!Array.isArray(detail)) return;
                const normalizedDetail = detail.map((d: any) => ({ ...d, id: getId(d) }));
                setItems(prev => {
                    // avoid unnecessary state updates during render - compare by id membership (string)
                    const same = prev.length === normalizedDetail.length && normalizedDetail.every((d: any) => prev.some(p => getId(p) === getId(d)));
                    return same ? prev : normalizedDetail;
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
            // ensure ids are normalized before storing
            const toStore = next.map(n => ({ ...n, id: getId(n) }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
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
        const newId = getId(item);
        if (!item || !newId) return;
        setItems(prev => {
            if (prev.find(i => getId(i) === newId)) return prev;
            if (prev.length >= MAX_ITEMS) {
                alert(`You can compare up to ${MAX_ITEMS} products`);
                return prev;
            }
            const next = [...prev, { ...item, id: newId }];
            persistAndNotify(next);
            return next;
        });
    }

    function removeItem(id: string | number) {
        const idStr = String(id);
        setItems(prev => {
            const next = prev.filter(i => getId(i) !== idStr);
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

    function contains(id: string | number) {
        return items.some(i => getId(i) === String(id));
    }

    return { items, addItem, removeItem, clear, contains };
}
