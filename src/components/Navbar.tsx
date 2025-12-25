'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface NavBarProps {
    storeName: string;
    storeLogo?: string;
    store?: any;
}

type NavbarItem = {
    id: number;
    label: string;
    href: string;
    order: number;
    parent_id?: number | null;
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
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [openChildDropdown, setOpenChildDropdown] = useState<number | null>(null);

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

    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<number | null>(null);
    const [mobileOpenChild, setMobileOpenChild] = useState<number | null>(null);
    const [subServices, setSubServices] = useState<Record<string, any[]>>({});
    const [hoveredSubSlug, setHoveredSubSlug] = useState<string | null>(null);

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
                        { id: 2, label: 'Products', href: '/products', order: 1, is_button: 0, is_active: 1 },
                        { id: 3, label: 'About Us', href: '/about', order: 2, is_button: 0, is_active: 1 },
                        { id: 4, label: 'Brands', href: '/brands', order: 3, is_button: 0, is_active: 1 },
                        { id: 5, label: 'FAQ', href: '/faq', order: 4, is_button: 0, is_active: 1 },
                        { id: 6, label: 'Support', href: '/support', order: 5, is_button: 0, is_active: 1 },
                    ]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchNavItems();

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
    const getChildren = (parentId: number) => {
        return navLinks.filter((item) => Number(item.parent_id ?? 0) === parentId && item.is_button === 0);
    };

    const hasChildren = (itemId: number) => navLinks.some((item) => Number(item.parent_id ?? 0) === itemId);

    const safeParseSubcategoryFromHref = (href: string): string | null => {
        try {
            // if href is relative, new URL with origin works
            const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
            return url.searchParams.get('subcategory') || null;
        } catch (err) {
            return null;
        }
    };

    // fetch subServices for a subSlug if needed
    const fetchSubServicesIfNeeded = (subSlug: string) => {
        if (!subServices[subSlug]) {
            fetch(`/api/services?subcategory=${encodeURIComponent(subSlug)}&status=2&limit=${MAX_SERVICES_PREVIEW}`)
                .then((r) => (r.ok ? r.json() : []))
                .then((data) => setSubServices((prev) => ({ ...prev, [subSlug]: Array.isArray(data) ? data : [] })))
                .catch((err) => console.error('Failed to fetch subcategory services', err));
        }
    };

    const initDesktopRightPanels = (children: NavbarItem[]) => {
        const firstChild = children.find((c) => getChildren(c.id).length > 0) ?? children[0];
        if (!firstChild) {
            setOpenChildDropdown(null);
            setHoveredSubSlug(null);
            return;
        }

        setOpenChildDropdown(firstChild.id);

        const grandchildren = getChildren(firstChild.id);
        const firstSubSlug = grandchildren.map((gc) => safeParseSubcategoryFromHref(gc.href)).find(Boolean) ?? null;
        if (firstSubSlug) {
            setHoveredSubSlug(firstSubSlug);
            fetchSubServicesIfNeeded(firstSubSlug);
        } else {
            setHoveredSubSlug(null);
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-center border-b border-solid border-muted page-bg backdrop-blur-none md:backdrop-blur-sm">
            <div className="flex items-center justify-between whitespace-nowrap py-3 w-full max-w-7xl">
                <a href="/" className="flex items-center gap-4 text-body hover:opacity-90 transition-opacity">
                    {storeLogo && !logoError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoSrc} alt={storeName} className="h-8 w-auto object-contain rounded" onError={() => setLogoError(true)} />
                    ) : (
                        <span className="material-symbols-outlined text-primary-var text-3xl">hub</span>
                    )}
                    {!hideSiteName && (
                        <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${hideSiteNameOnMobile ? 'hidden sm:inline-block' : ''}`}>{storeName}</h2>
                    )}
                </a>

                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <nav className="flex items-center gap-9">
                        {navLinks
                            .filter((link) => link.is_button === 0 && (link.parent_id == null || link.parent_id === 0))
                            .map((link) => {
                                const children = getChildren(link.id);
                                const colCount = Math.max(1, Math.ceil(children.length / ITEMS_PER_COLUMN));
                                const containerMinWidth = Math.max(
                                    DROPDOWN_MIN_WIDTH,
                                    colCount * CHILD_COLUMN_WIDTH + GRANDCHILD_COLUMN_WIDTH + SERVICE_COLUMN_WIDTH
                                );
                                const hasDropdown = link.is_dropdown === 1 && children.length > 0;

                                return (
                                    <div
                                        key={link.id}
                                        className="static"
                                        onMouseEnter={() => {
                                            clearAllCloseTimers();
                                            if (hasDropdown) {
                                                if (openDropdown !== link.id) {
                                                    initDesktopRightPanels(children);
                                                }
                                                setOpenDropdown(link.id);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                            closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium leading-normal text-subtext hover-text-primary transition-colors flex items-center gap-1"
                                        >
                                            {link.label}
                                            {hasDropdown && <span className="material-symbols-outlined text-sm">expand_more</span>}
                                        </Link>

                                        {hasDropdown && openDropdown === link.id && (
                                            <div
                                                className="absolute top-full left-0 right-0 w-full bg-card shadow-lg border-b border-muted py-2 z-60 pointer-events-auto"
                                                onMouseEnter={() => {
                                                    clearAllCloseTimers();
                                                    setOpenDropdown(link.id);
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
                                                                        onMouseEnter={() => { clearAllCloseTimers(); setOpenDropdown(link.id); }}
                                                                    >
                                                                        {col.map((child) => {
                                                                            const grandchildren = getChildren(child.id);
                                                                            const childHasDesc = grandchildren.length > 0;
                                                                            return (
                                                                                <div
                                                                                    key={child.id}
                                                                                    className="relative"
                                                                                    onMouseEnter={() => {
                                                                                        clearAllCloseTimers();
                                                                                        setOpenChildDropdown(child.id);
                                                                                        setOpenDropdown(link.id);
                                                                                    }}
                                                                                    onMouseLeave={() => {
                                                                                        if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
                                                                                        childCloseTimerRef.current = setTimeout(() => setOpenChildDropdown(null), CHILD_CLOSE_DELAY_MS);
                                                                                    }}
                                                                                >
                                                                                    <Link
                                                                                        href={child.href}
                                                                                        className="px-4 py-2 text-sm text-subtext hover-bg-card hover-text-primary transition-colors flex items-center justify-between"
                                                                                        onMouseEnter={() => {
                                                                                            clearAllCloseTimers();
                                                                                            setOpenDropdown(link.id);
                                                                                            setOpenChildDropdown(child.id);
                                                                                            const sub = safeParseSubcategoryFromHref(child.href);
                                                                                            if (sub) {
                                                                                                setHoveredSubSlug(sub);
                                                                                                fetchSubServicesIfNeeded(sub);
                                                                                            }
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
                                                                setOpenDropdown(link.id);
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
                                                                        onMouseEnter={() => setOpenChildDropdown(child.id)}
                                                                        className={`py-1 ${openChildDropdown === child.id ? 'block' : 'hidden'}`}
                                                                    >
                                                                        {grandchildren.map((gc) => {
                                                                            const subSlug = safeParseSubcategoryFromHref(gc.href);
                                                                            return (
                                                                                <div key={`g-${gc.id}`}>
                                                                                    <Link
                                                                                        href={gc.href}
                                                                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors"
                                                                                        onMouseEnter={() => {
                                                                                            clearAllCloseTimers();
                                                                                            setOpenDropdown(link.id);
                                                                                            setOpenChildDropdown(child.id);
                                                                                            if (subSlug) {
                                                                                                setHoveredSubSlug(subSlug);
                                                                                                fetchSubServicesIfNeeded(subSlug);
                                                                                            }
                                                                                        }}
                                                                                        onMouseLeave={() => {
                                                                                            if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
                                                                                            serviceCloseTimerRef.current = setTimeout(() => setHoveredSubSlug((prev) => (prev === subSlug ? null : prev)), CHILD_CLOSE_DELAY_MS);
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
                                                                setOpenDropdown(link.id);
                                                            }}
                                                            onMouseLeave={() => {
                                                                if (serviceCloseTimerRef.current) clearTimeout(serviceCloseTimerRef.current);
                                                                serviceCloseTimerRef.current = setTimeout(() => setHoveredSubSlug(null), CHILD_CLOSE_DELAY_MS);
                                                            }}
                                                        >
                                                            <div className="py-2 px-3">
                                                                {hoveredSubSlug && subServices[hoveredSubSlug] && subServices[hoveredSubSlug].length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {subServices[hoveredSubSlug].map((s) => (
                                                                            <Link key={s.id} href={`/services/${s.slug}`} className="flex items-center gap-3 hover:bg-slate-50 px-2 py-2 rounded">
                                                                                {s.thumbnail ? (
                                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                                    <img src={s.thumbnail} alt={s.title} className="w-12 h-8 object-cover rounded" />
                                                                                ) : (
                                                                                    <span className="rounded w-12 h-8 bg-slate-100 block" />
                                                                                )}
                                                                                <div className="flex-1">
                                                                                    <div className="text-sm font-medium text-slate-800 truncate">{s.title}</div>
                                                                                    <div className="text-xs text-slate-500 truncate">{s.excerpt}</div>
                                                                                </div>
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-slate-400">Hover a subcategory to preview services</div>
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

                    {navLinks.filter((link) => link.is_button === 1).map((link) => (
                        <a
                            key={link.id}
                            href={link.href}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
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
                        {navLinks.filter((link) => link.is_button === 0 && (link.parent_id == null || link.parent_id === 0)).map((link) => {
                            const children = getChildren(link.id);
                            const hasDropdown = link.is_dropdown === 1 && children.length > 0;
                            const isExpanded = mobileOpenDropdown === link.id;

                            return (
                                <div key={link.id}>
                                    <div className="flex items-center justify-between">
                                        <a
                                            className="flex-1 text-sm font-medium leading-normal text-slate-700 hover:text-primary hover:bg-slate-100 px-4 py-3 rounded-lg transition-colors"
                                            href={link.href}
                                            onClick={() => !hasDropdown && setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                        {hasDropdown && (
                                            <button onClick={() => setMobileOpenDropdown(isExpanded ? null : link.id)} className="px-2 py-3 text-slate-700 hover:text-primary">
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
                                                                className="text-sm text-slate-600 hover:text-primary hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors flex-1"
                                                                onClick={() => setIsMenuOpen(false)}
                                                            >
                                                                {child.label}
                                                            </a>
                                                            {grandchildren.length > 0 && (
                                                                <button onClick={() => setMobileOpenChild(childOpen ? null : child.id)} className="px-2 py-2 text-slate-700 hover:text-primary">
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
                                                                        className="text-sm text-slate-600 hover:text-primary hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
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

                        {navLinks.filter((link) => link.is_button === 1).map((link) => (
                            <a
                                key={link.id}
                                href={link.href}
                                className="flex items-center justify-center overflow-hidden rounded-lg h-10 px-4 mt-2 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
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
