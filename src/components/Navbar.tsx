'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface NavBarProps {
    storeName: string;
    storeLogo?: string;
    store?: any;
}

type NavbarItem = {
    _id?: string;
    id?: number;
    label: string;
    href: string;
    order: number;
    // parent_id can be a numeric legacy id or an ObjectId (string)
    parent_id?: any | null;
    is_button: number;
    is_active: number;
    is_dropdown?: number;
};

/* Layout constants (unchanged) */
export const ITEMS_PER_COLUMN = 8;
export const CHILD_COLUMN_WIDTH = 260;
export const GRANDCHILD_COLUMN_WIDTH = 320;
export const SERVICE_COLUMN_WIDTH = 420;
export const DROPDOWN_MIN_WIDTH = 420;
export const MAX_SERVICES_PREVIEW = 4;
export const CLOSE_DELAY_MS = 200;
export const CHILD_CLOSE_DELAY_MS = 150;

const NavBar = ({ storeName, storeLogo, store }: NavBarProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navLinks, setNavLinks] = useState<NavbarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);
    const [openChildDropdown, setOpenChildDropdown] = useState<string | number | null>(null);

    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const childCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const serviceCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAllCloseTimers = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        if (childCloseTimerRef.current) {
            clearTimeout(childCloseTimerRef.current);
            childCloseTimerRef.current = null;
        }
        if (serviceCloseTimerRef.current) {
            clearTimeout(serviceCloseTimerRef.current);
            serviceCloseTimerRef.current = null;
        }
    };

    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | number | null>(null);
    const [mobileOpenChild, setMobileOpenChild] = useState<string | number | null>(null);
    const [subServices, setSubServices] = useState<Record<string, any[]>>({});
    const [hoveredSubSlug, setHoveredSubSlug] = useState<string | null>(null);
    const [defaultProducts, setDefaultProducts] = useState<any[]>([]);

    // Logo load state: if the image fails to load, we show a fallback icon
    const [logoError, setLogoError] = useState(false);

    // Use provided logo path as-is (avoid client-only transforms which cause hydration mismatches)
    // If the value is relative (starts with '/'), it's fine — the browser will resolve it consistently on server and client.
    const logoSrc = storeLogo || undefined;

    // Optional: allow hiding the site name on mobile via a store flag (truthy values supported)
    const hideSiteNameOnMobile = Boolean(
        store?.hideSiteNameOnMobile || store?.hide_site_name_on_mobile || store?.hide_site_name_mobile
    );

    // Optional: remove the site name entirely (hide on all screens)
    const hideSiteName = Boolean(store?.hideSiteName || store?.hide_site_name);

    // Logo size from store settings (small, medium, large)
    const logoSize = store?.logoSize || store?.logo_size || 'small';
    const logoHeightClass = logoSize === 'large' ? 'h-16' : logoSize === 'medium' ? 'h-12' : 'h-8';
    const siteNameSizeClass = logoSize === 'large' ? 'text-2xl' : logoSize === 'medium' ? 'text-xl' : 'text-lg';
    const navItemSizeClass = logoSize === 'large' ? 'text-lg' : logoSize === 'medium' ? 'text-base' : 'text-sm';
    const navIconSizeClass = logoSize === 'large' ? 'text-lg' : logoSize === 'medium' ? 'text-base' : 'text-sm';

    useEffect(() => {
        let isMounted = true;

        const fetchNavItems = async () => {
            try {
                const response = await fetch('/api/navbar');
                if (response.ok) {
                    const items = await response.json();
                    if (!Array.isArray(items)) throw new Error('Invalid navbar data');
                    const activeItems = items
                        .filter((item: NavbarItem) => item.is_active === 1)
                        .map((item: any) => ({
                            ...item,
                            id: item._id || item.id,
                            parent_id: item.parent_id || null
                        }))
                        .sort((a: NavbarItem, b: NavbarItem) => a.order - b.order);
                    if (isMounted) setNavLinks(activeItems);
                } else {
                    throw new Error('Failed to fetch navbar');
                }
            } catch (error) {
                console.error('Error fetching navbar items:', error);
                if (isMounted) {
                    setNavLinks([
                        { id: 1, label: 'Home', href: '/', order: 0, is_button: 0, is_active: 1 },
                        { id: 2, label: 'Shop', href: '/shop', order: 1, is_button: 0, is_active: 1, is_dropdown: 1 },
                        { id: 3, label: 'Midea AC', href: '/midea-ac', order: 2, is_button: 0, is_active: 1 },
                        { id: 4, label: 'Portfolio', href: '/projects', order: 3, is_button: 0, is_active: 1 },
                        { id: 5, label: 'About Us', href: '/about', order: 4, is_button: 0, is_active: 1 },
                        { id: 6, label: 'FAQ', href: '/faq', order: 5, is_button: 0, is_active: 1 },
                    ]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchNavItems();

        fetch('/api/products?limit=4&featured=1')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setDefaultProducts(data);
                else if (data && data.rows && Array.isArray(data.rows)) setDefaultProducts(data.rows);
            })
            .catch(() => { });

        return () => {
            isMounted = false;
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
            if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
        };
    }, []);

    // When a desktop dropdown closes, clear the dependent right-panel state.
    useEffect(() => {
        if (openDropdown === null) {
            setOpenChildDropdown(null);
            setHoveredSubSlug(null);
        }
    }, [openDropdown]);

    // Helpers
    const getChildren = (parentId?: string | number) => {
        if (parentId === undefined || parentId === null) return [] as NavbarItem[];
        return navLinks.filter((item) => String(item.parent_id ?? '') === String(parentId) && item.is_button === 0);
    };

    const hasChildren = (itemId?: string | number) => {
        if (itemId === undefined || itemId === null) return false;
        return navLinks.some((item) => String(item.parent_id ?? '') === String(itemId));
    };

    const parseLinkInfo = (href: string): { type: 'category' | 'subcategory' | null, slug: string | null } => {
        try {
            // Handle absolute or relative URLs
            const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

            // 1. Explicit search params
            const subQ = url.searchParams.get('subcategory');
            if (subQ) return { type: 'subcategory', slug: subQ };
            const catQ = url.searchParams.get('category');
            if (catQ) return { type: 'category', slug: catQ };

            // 2. Path patterns
            const path = url.pathname.replace(/\/$/, ''); // remove trailing slash
            const segments = path.split('/').filter(Boolean);

            // Pattern: /shop/category/[slug]/[subslug] or /shop/category/[slug]
            if ((segments[0] === 'services' || segments[0] === 'shop') && segments[1] === 'category') {
                if (segments.length >= 4) return { type: 'subcategory', slug: segments[3] };
                if (segments.length >= 3) return { type: 'category', slug: segments[2] };
            }

            // Pattern: /shop/[category]/[subcategory] if not using 'category' segment
            if ((segments[0] === 'services' || segments[0] === 'shop') && segments.length >= 3) {
                return { type: 'subcategory', slug: segments[2] };
            }
            if ((segments[0] === 'services' || segments[0] === 'shop') && segments.length >= 2) {
                return { type: 'category', slug: segments[1] };
            }

            return { type: null, slug: null };
        } catch (err) {
            return { type: null, slug: null };
        }
    };

    // fetch subProducts for a slug if needed
    const fetchSubProductsIfNeeded = (slug: string, type: 'category' | 'subcategory' = 'subcategory') => {
        const cacheKey = `${type}:${slug}`;
        if (!subServices[cacheKey]) {
            const param = type === 'category' ? 'category' : 'subcategory';
            fetch(`/api/products?${param}=${encodeURIComponent(slug)}&limit=${MAX_SERVICES_PREVIEW}&featured=1`)
                .then((r) => (r.ok ? r.json() : []))
                .then((data) => setSubServices((prev) => ({ ...prev, [cacheKey]: Array.isArray(data) ? data : [] })))
                .catch((err) => console.error('Failed to fetch dropdown products', err));
        }
    };

    const initDesktopRightPanels = (children: NavbarItem[]) => {
        const firstChild = children.find((c) => getChildren(c.id).length > 0) ?? children[0];
        if (!firstChild) {
            setOpenChildDropdown(null);
            setHoveredSubSlug(null);
            return;
        }

        if (firstChild.id !== undefined) setOpenChildDropdown(firstChild.id);

        const grandchildren = getChildren(firstChild.id);
        if (grandchildren.length > 0) {
            const target = grandchildren[0];
            const info = parseLinkInfo(target.href);
            if (info.slug && info.type) {
                const key = `${info.type}:${info.slug}`;
                setHoveredSubSlug(key);
                fetchSubProductsIfNeeded(info.slug, info.type);
            } else {
                setHoveredSubSlug(null);
            }
        } else {
            const target = firstChild;
            const info = parseLinkInfo(target.href);
            if (info.slug && info.type) {
                const key = `${info.type}:${info.slug}`;
                setHoveredSubSlug(key);
                fetchSubProductsIfNeeded(info.slug, info.type);
            } else {
                setHoveredSubSlug(null);
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-center border-b border-solid border-muted page-bg backdrop-blur-none md:backdrop-blur-sm">
            <div className="flex items-center justify-between whitespace-nowrap py-3 w-full max-w-7xl">
                <a href="/" className="flex items-center gap-4 text-body hover:opacity-90 transition-opacity">
                    {storeLogo && !logoError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoSrc} alt={storeName} className={`${logoHeightClass} w-auto object-contain rounded`} onError={() => setLogoError(true)} />
                    ) : (
                        <span className="material-symbols-outlined text-primary-var text-3xl">hub</span>
                    )}
                    {!hideSiteName && (
                        <h2 className={`${siteNameSizeClass} font-bold leading-tight tracking-[-0.015em] ${hideSiteNameOnMobile ? 'hidden sm:inline-block' : ''}`}>{storeName}</h2>
                    )}
                </a>

                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <nav className="flex items-center gap-9">
                        {navLinks
                            .filter((link) => link.is_button === 0 && (link.parent_id == null || link.parent_id === 0))
                            .map((link, linkIdx) => {
                                const children = getChildren(link.id);
                                const colCount = Math.max(1, Math.ceil(children.length / ITEMS_PER_COLUMN));
                                const containerMinWidth = Math.max(
                                    DROPDOWN_MIN_WIDTH,
                                    colCount * CHILD_COLUMN_WIDTH + GRANDCHILD_COLUMN_WIDTH + SERVICE_COLUMN_WIDTH
                                );
                                const hasDropdown = link.is_dropdown === 1 && children.length > 0;

                                return (
                                    <div
                                        key={`${link._id ?? link.id ?? link.href}-${linkIdx}`}
                                        className="static"
                                        onMouseEnter={() => {
                                            clearAllCloseTimers();
                                            if (hasDropdown) {
                                                if (String(openDropdown) !== String(link.id)) {
                                                    initDesktopRightPanels(children);
                                                }
                                                if (link.id !== undefined) setOpenDropdown(link.id);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                            closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`${navItemSizeClass} font-medium leading-normal text-subtext hover-text-primary transition-colors flex items-center gap-1`}
                                        >
                                            {link.label}
                                            {hasDropdown && <span className={`material-symbols-outlined ${navIconSizeClass}`}>expand_more</span>}
                                        </Link>

                                        {hasDropdown && String(openDropdown) === String(link.id) && (
                                            <div
                                                className="absolute top-full left-0 right-0 w-full bg-card shadow-lg border-b border-muted py-2 z-60 pointer-events-auto"
                                                onMouseEnter={() => {
                                                    clearAllCloseTimers();
                                                    if (link.id !== undefined) setOpenDropdown(link.id);
                                                }}
                                                onMouseLeave={() => {
                                                    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                                    if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
                                                    if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
                                                    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
                                                }}
                                            >
                                                <div className="mx-auto w-full max-w-7xl px-4">
                                                    <div className="flex gap-0 flex-nowrap overflow-x-auto" style={{ minWidth: `${containerMinWidth}px` }}>
                                                        <div className="flex-1 px-0 py-1 flex gap-0 flex-nowrap">
                                                            {(() => {
                                                                const perCol = ITEMS_PER_COLUMN;
                                                                const cols: NavbarItem[][] = [];
                                                                for (let i = 0; i < children.length; i += perCol) {
                                                                    cols.push(children.slice(i, i + perCol));
                                                                }
                                                                return cols.map((col, colIdx) => (
                                                                    <div
                                                                        key={`col-${colIdx}`}
                                                                        className="flex flex-1 flex-col p-1 gap-0"
                                                                        style={{ minWidth: `${CHILD_COLUMN_WIDTH}px` }}
                                                                        onMouseEnter={() => { clearAllCloseTimers(); if (link.id !== undefined) setOpenDropdown(link.id); }}
                                                                    >
                                                                        {col.map((child, childIdx) => {
                                                                            const grandchildren = getChildren(child.id);
                                                                            const childHasDesc = grandchildren.length > 0;
                                                                            return (
                                                                                <div
                                                                                    key={`${child._id ?? child.id ?? child.href}-${childIdx}`}
                                                                                    className="relative"
                                                                                >
                                                                                    <Link
                                                                                        href={child.href}
                                                                                        className={`px-4 py-2 ${navItemSizeClass} text-subtext hover-bg-card hover-text-primary transition-colors flex items-center justify-between`}
                                                                                        onMouseEnter={() => {
                                                                                            clearAllCloseTimers();
                                                                                            if (link.id !== undefined) setOpenDropdown(link.id);
                                                                                            if (child.id !== undefined) setOpenChildDropdown(child.id);

                                                                                            // Automatically show first subcategory's services if they exist
                                                                                            if (grandchildren.length > 0) {
                                                                                                const target = grandchildren[0];
                                                                                                const info = parseLinkInfo(target.href);
                                                                                                if (info.slug && info.type) {
                                                                                                    const key = `${info.type}:${info.slug}`;
                                                                                                    setHoveredSubSlug(key);
                                                                                                    fetchSubProductsIfNeeded(info.slug, info.type);
                                                                                                    return;
                                                                                                }
                                                                                            }

                                                                                            const info = parseLinkInfo(child.href);
                                                                                            if (info.slug && info.type) {
                                                                                                const key = `${info.type}:${info.slug}`;
                                                                                                setHoveredSubSlug(key);
                                                                                                fetchSubProductsIfNeeded(info.slug, info.type);
                                                                                            } else {
                                                                                                setHoveredSubSlug(null);
                                                                                            }
                                                                                        }}
                                                                                        onMouseLeave={() => {
                                                                                            if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
                                                                                            childCloseTimerRef.current = setTimeout(() => setOpenChildDropdown(null), CHILD_CLOSE_DELAY_MS);
                                                                                        }}
                                                                                    >
                                                                                        <span>{child.label}</span>
                                                                                        {childHasDesc && <span className="material-symbols-outlined text-xs">chevron_right</span>}
                                                                                    </Link>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>

                                                        <div
                                                            className="border-l border-slate-100 flex-none overflow-y-auto max-h-[420px]"
                                                            style={{ width: `${GRANDCHILD_COLUMN_WIDTH}px` }}
                                                            onMouseEnter={() => {
                                                                clearAllCloseTimers();
                                                                if (link.id !== undefined) setOpenDropdown(link.id);
                                                            }}
                                                            onMouseLeave={() => {
                                                                if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
                                                                childCloseTimerRef.current = setTimeout(() => setOpenChildDropdown(null), CHILD_CLOSE_DELAY_MS);
                                                            }}
                                                        >
                                                            {children.map((child) => {
                                                                const grandchildren = getChildren(child.id);
                                                                if (!grandchildren.length) return null;
                                                                return (
                                                                    <div
                                                                        key={`col-${child.id}`}
                                                                        onMouseEnter={() => { if (child.id !== undefined) setOpenChildDropdown(child.id); }}
                                                                        className={`py-1 ${String(openChildDropdown) === String(child.id) ? 'block' : 'hidden'}`}
                                                                    >
                                                                        {grandchildren.map((gc, gcIdx) => {
                                                                            const info = parseLinkInfo(gc.href);
                                                                            const subSlug = info.slug;
                                                                            const subType = info.type;
                                                                            const cacheKey = subSlug && subType ? `${subType}:${subSlug}` : null;
                                                                            return (
                                                                                <div key={`g-${gc._id ?? gc.id ?? gc.href}-${gcIdx}`}>
                                                                                    <Link
                                                                                        href={gc.href}
                                                                                        className={`block px-4 py-2 ${navItemSizeClass} text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors`}
                                                                                        onMouseEnter={() => {
                                                                                            clearAllCloseTimers();
                                                                                            if (link.id !== undefined) setOpenDropdown(link.id);
                                                                                            if (child.id !== undefined) setOpenChildDropdown(child.id);
                                                                                            if (subSlug && subType) {
                                                                                                const key = `${subType}:${subSlug}`;
                                                                                                setHoveredSubSlug(key);
                                                                                                fetchSubProductsIfNeeded(subSlug, subType);
                                                                                            }
                                                                                        }}
                                                                                        onMouseLeave={() => {
                                                                                            if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
                                                                                            serviceCloseTimerRef.current = setTimeout(() => setHoveredSubSlug((prev) => (prev === cacheKey ? null : prev)), CHILD_CLOSE_DELAY_MS);
                                                                                        }}
                                                                                    >
                                                                                        {gc.label}
                                                                                    </Link>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div
                                                            className="border-l border-slate-100 bg-white flex-none overflow-y-auto max-h-[420px]"
                                                            style={{ width: `${SERVICE_COLUMN_WIDTH}px` }}
                                                            onMouseEnter={() => {
                                                                clearAllCloseTimers();
                                                                if (link.id !== undefined) setOpenDropdown(link.id);
                                                            }}
                                                            onMouseLeave={() => {
                                                                if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
                                                                serviceCloseTimerRef.current = setTimeout(() => setHoveredSubSlug(null), CHILD_CLOSE_DELAY_MS);
                                                            }}
                                                        >
                                                            <div className="py-2 px-3">
                                                                {hoveredSubSlug ? (
                                                                    // We are focused on a specific category/subcategory
                                                                    subServices[hoveredSubSlug] === undefined ? (
                                                                        // Loading state
                                                                        <div className="space-y-2">
                                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Products</div>
                                                                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                                                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                                                                <p className="text-xs">Loading...</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : subServices[hoveredSubSlug].length > 0 ? (
                                                                        // Products found
                                                                        <div className="space-y-2">
                                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Products</div>
                                                                            {subServices[hoveredSubSlug].slice(0, 4).map((s, sIdx) => (
                                                                                <Link key={`${s._id ?? s.id ?? s.slug}-${sIdx}`} href={`/products/${s.slug}`} className="flex items-center gap-3 hover:bg-slate-50 px-2 py-2 rounded transition-colors group">
                                                                                    {s.thumbnail ? (
                                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                                        <img src={s.thumbnail} alt={s.title} className="w-16 h-12 object-contain rounded shadow-sm group-hover:scale-105 transition-transform" />
                                                                                    ) : (
                                                                                        <div className="rounded w-16 h-12 bg-slate-100 flex items-center justify-center">
                                                                                            <span className="material-symbols-outlined text-slate-300">image</span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{s.title}</div>
                                                                                        {Number(s.price) > 0 && (
                                                                                            <div className="text-xs font-bold text-primary">NPR {Number(s.price).toLocaleString()}</div>
                                                                                        )}
                                                                                        {s.model && (
                                                                                            <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{s.model}</div>
                                                                                        )}
                                                                                    </div>
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        // No products found for this specific category
                                                                        <div className="space-y-2">
                                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Products</div>
                                                                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                                                                                <p className="text-xs">No products found</p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    // Recommended products (no specific hover)
                                                                    <div className="space-y-2">
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Recommended</div>
                                                                        {(defaultProducts.length > 0 ? defaultProducts : []).map((s, sIdx) => (
                                                                            <Link key={`def-${s._id ?? s.id ?? s.slug}-${sIdx}`} href={`/products/${s.slug}`} className="flex items-center gap-3 hover:bg-slate-50 px-2 py-2 rounded transition-colors group">
                                                                                {s.thumbnail ? (
                                                                                    <img src={s.thumbnail} alt={s.title} className="w-16 h-12 object-contain rounded shadow-sm group-hover:scale-105 transition-transform" />
                                                                                ) : (
                                                                                    <div className="rounded w-16 h-12 bg-slate-100 flex items-center justify-center">
                                                                                        <span className="material-symbols-outlined text-slate-300">image</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{s.title}</div>
                                                                                    {Number(s.price) > 0 && (
                                                                                        <div className="text-xs font-bold text-primary">NPR {Number(s.price).toLocaleString()}</div>
                                                                                    )}
                                                                                    {s.model && (
                                                                                        <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{s.model}</div>
                                                                                    )}
                                                                                </div>
                                                                            </Link>
                                                                        ))}
                                                                        {defaultProducts.length === 0 && (
                                                                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                                                                                <p className="text-xs">No products available</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </nav>

                    {navLinks.filter((link) => link.is_button === 1).map((link, linkIdx) => (
                        <a
                            key={`${link._id ?? link.id ?? link.href}-${linkIdx}`}
                            href={link.href}
                            className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white ${navItemSizeClass} font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors`}
                        >
                            <span className="truncate">{link.label}</span>
                        </a>
                    ))}
                </div>

                <div className="md:hidden">
                    <button
                        onClick={() => {
                            const willOpen = !isMenuOpen;
                            setIsMenuOpen(willOpen);
                            if (!willOpen) {
                                setMobileOpenDropdown(null);
                                setMobileOpenChild(null);
                            }
                        }}
                        className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-slate-800">{isMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-card backdrop-blur-none border-b border-slate-200/80 shadow-lg">
                    <nav className="flex flex-col px-4 py-4 gap-1">
                        {navLinks.filter((link) => link.is_button === 0 && (link.parent_id == null || link.parent_id === 0)).map((link, linkIdx) => {
                            const children = getChildren(link.id);
                            const hasDropdown = link.is_dropdown === 1 && children.length > 0;
                            const isExpanded = mobileOpenDropdown === link.id;

                            return (
                                <div key={`${link._id ?? link.id ?? link.href}-${linkIdx}`}>
                                    <div className="flex items-center justify-between">
                                        <a
                                            className={`flex-1 ${navItemSizeClass} font-medium leading-normal text-slate-700 hover:text-primary hover:bg-slate-100 px-4 py-3 rounded-lg transition-colors`}
                                            href={link.href}
                                            onClick={() => !hasDropdown && setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                        {hasDropdown && (
                                            <button onClick={() => setMobileOpenDropdown(isExpanded ? null : (link.id ?? null))} className="px-2 py-3 text-slate-700 hover:text-primary">
                                                <span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                                            </button>
                                        )}
                                    </div>

                                    {hasDropdown && isExpanded && (
                                        <div className="pl-4 mt-1 flex flex-col gap-1">
                                            {children.map((child) => {
                                                const grandchildren = getChildren(child.id);
                                                const childOpen = mobileOpenChild === child.id;
                                                return (
                                                    <div key={`m-${child.id}`}>
                                                        <div className="flex items-center justify-between">
                                                            <a
                                                                href={child.href}
                                                                className={`${navItemSizeClass} text-slate-600 hover:text-primary hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors flex-1`}
                                                                onClick={() => setIsMenuOpen(false)}
                                                            >
                                                                {child.label}
                                                            </a>
                                                            {grandchildren.length > 0 && (
                                                                <button onClick={() => setMobileOpenChild(childOpen ? null : (child.id ?? null))} className="px-2 py-2 text-slate-700 hover:text-primary">
                                                                    <span className="material-symbols-outlined text-sm">{childOpen ? 'expand_less' : 'expand_more'}</span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {grandchildren.length > 0 && childOpen && (
                                                            <div className="pl-4 mt-1 flex flex-col gap-1">
                                                                {grandchildren.map((gc) => (
                                                                    <a
                                                                        key={`g-${gc.id}`}
                                                                        href={gc.href}
                                                                        className={`${navItemSizeClass} text-slate-600 hover:text-primary hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors`}
                                                                        onClick={() => setIsMenuOpen(false)}
                                                                    >
                                                                        {gc.label}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {navLinks.filter((link) => link.is_button === 1).map((link, linkIdx) => (
                            <a
                                key={`${link._id ?? link.id ?? link.href}-${linkIdx}`}
                                href={link.href}
                                className={`flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 mt-2 bg-primary text-white ${navItemSizeClass} font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="truncate">{link.label}</span>
                            </a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default NavBar;
