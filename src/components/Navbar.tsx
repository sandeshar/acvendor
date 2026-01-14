'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

/* Layout constants */
export const CLOSE_DELAY_MS = 200;
export const CHILD_CLOSE_DELAY_MS = 150;

const NavBar = ({ storeName, storeLogo, store }: NavBarProps) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navLinks, setNavLinks] = useState<NavbarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);
    const [openChildDropdown, setOpenChildDropdown] = useState<string | number | null>(null);

    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const childCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isActive = (href: string) => {
        if (!pathname) return false;

        // Handle absolute URLs by extracting pathname
        let targetPath = href;
        if (href.startsWith('http')) {
            try {
                const url = new URL(href);
                targetPath = url.pathname;
            } catch (e) {
                return false;
            }
        }

        // Normalize both paths (remove trailing slashes, handle empty)
        const normalizedHref = targetPath.replace(/\/$/, '') || '/';
        const normalizedPathname = pathname.replace(/\/$/, '') || '/';

        if (normalizedHref === '/') {
            return normalizedPathname === '/';
        }

        return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/');
    };

    const clearAllCloseTimers = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        if (childCloseTimerRef.current) {
            clearTimeout(childCloseTimerRef.current);
            childCloseTimerRef.current = null;
        }
    };

    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | number | null>(null);
    const [mobileOpenChild, setMobileOpenChild] = useState<string | number | null>(null);

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
                        .filter((item: NavbarItem) => item.is_active === 1 && item.label !== 'Products')
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

        return () => {
            isMounted = false;
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (childCloseTimerRef.current) clearTimeout(childCloseTimerRef.current);
        };
    }, []);

    // When a desktop dropdown closes, clear the dependent right-panel state.
    useEffect(() => {
        if (openDropdown === null) {
            setOpenChildDropdown(null);
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
                                const hasDropdown = link.is_dropdown === 1 && children.length > 0;

                                return (
                                    <div
                                        key={`${link._id ?? link.id ?? link.href}-${linkIdx}`}
                                        className="relative"
                                        onMouseEnter={() => {
                                            clearAllCloseTimers();
                                            if (hasDropdown && link.id !== undefined) {
                                                setOpenDropdown(link.id);
                                                // Default to first child with subcategories
                                                const firstWithSubs = children.find(c => getChildren(c.id).length > 0) || children[0];
                                                if (firstWithSubs) setOpenChildDropdown(firstWithSubs.id ?? null);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                            closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`${navItemSizeClass} transition-all flex items-center gap-1.5 relative py-2 group/link ${isActive(link.href) ? 'text-primary font-bold' : 'text-slate-600 font-medium hover:text-primary'}`}
                                        >
                                            {link.label}
                                            {hasDropdown && (
                                                <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${String(openDropdown) === String(link.id) ? 'rotate-180 text-primary' : 'text-slate-400'}`}>
                                                    keyboard_arrow_down
                                                </span>
                                            )}
                                        </Link>

                                        {hasDropdown && String(openDropdown) === String(link.id) && (
                                            <div
                                                className="absolute top-full left-0 bg-white z-60 pointer-events-auto border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex"
                                                style={{ minWidth: '480px' }}
                                                onMouseEnter={() => {
                                                    clearAllCloseTimers();
                                                    if (link.id !== undefined) setOpenDropdown(link.id);
                                                }}
                                                onMouseLeave={() => {
                                                    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                                                    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), CLOSE_DELAY_MS);
                                                }}
                                            >
                                                {/* Left Column: Categories */}
                                                <div className="w-1/2 border-r border-slate-50 p-2">
                                                    <div className="flex flex-col">
                                                        {children.map((child, childIdx) => {
                                                            const hasSubs = getChildren(child.id).length > 0;
                                                            const isFocused = String(openChildDropdown) === String(child.id);

                                                            return (
                                                                <Link
                                                                    key={`${child._id ?? child.id}-${childIdx}`}
                                                                    href={child.href}
                                                                    className={`px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${isFocused ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}
                                                                    onMouseEnter={() => {
                                                                        if (child.id !== undefined) setOpenChildDropdown(child.id);
                                                                    }}
                                                                >
                                                                    <span className="text-sm font-bold">{child.label}</span>
                                                                    {hasSubs && (
                                                                        <span className={`material-symbols-outlined text-[18px] transition-transform ${isFocused ? 'translate-x-1' : 'opacity-40 group-hover:opacity-100'}`}>
                                                                            chevron_right
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Right Column: Subcategories (Dynamic) */}
                                                <div className="w-1/2 bg-slate-50/30 p-2 min-h-[200px]">
                                                    {children.map((child) => {
                                                        const grandchildren = getChildren(child.id);
                                                        if (grandchildren.length === 0) return null;

                                                        return (
                                                            <div
                                                                key={`subs-${child.id}`}
                                                                className={`${String(openChildDropdown) === String(child.id) ? 'flex flex-col gap-1 animate-in fade-in slide-in-from-left-1 duration-200' : 'hidden'}`}
                                                            >
                                                                {grandchildren.map((gc, gcIdx) => (
                                                                    <Link
                                                                        key={`gc-${gc.id}-${gcIdx}`}
                                                                        href={gc.href}
                                                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(gc.href) ? 'text-primary bg-white shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm'}`}
                                                                    >
                                                                        {gc.label}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}

                                                    {!openChildDropdown && (
                                                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                                            <span className="material-symbols-outlined text-3xl">category</span>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Select a Category</p>
                                                        </div>
                                                    )}
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
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <nav className="flex flex-col px-6 py-8 gap-4 max-h-[85vh] overflow-y-auto">
                        {navLinks.filter((link) => link.is_button === 0 && (link.parent_id == null || link.parent_id === 0)).map((link, linkIdx) => {
                            const children = getChildren(link.id);
                            const hasDropdown = link.is_dropdown === 1 && children.length > 0;
                            const isExpanded = mobileOpenDropdown === link.id;

                            return (
                                <div key={`${link._id ?? link.id ?? link.href}-${linkIdx}`} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <a
                                            className={`text-lg transition-all ${isActive(link.href) ? 'text-primary font-bold' : 'text-slate-900 font-semibold'}`}
                                            href={link.href}
                                            onClick={() => !hasDropdown && setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                        {hasDropdown && (
                                            <button
                                                onClick={() => setMobileOpenDropdown(isExpanded ? null : (link.id ?? null))}
                                                className={`w-10 h-10 flex items-center justify-center transition-all rounded-full ${isExpanded ? 'bg-slate-100 text-primary' : 'text-slate-400'}`}
                                            >
                                                <span className={`material-symbols-outlined text-[24px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                                            </button>
                                        )}
                                    </div>

                                    {hasDropdown && isExpanded && (
                                        <div className="flex flex-col gap-4 pl-4 pt-2 border-l border-slate-100 ml-1">
                                            {children.map((child) => {
                                                const grandchildren = getChildren(child.id);
                                                const childOpen = mobileOpenChild === child.id;
                                                return (
                                                    <div key={`m-${child.id}`} className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <a
                                                                href={child.href}
                                                                className={`text-sm tracking-tight transition-all ${isActive(child.href) ? 'text-primary font-bold' : 'text-slate-600 font-medium'}`}
                                                                onClick={() => !grandchildren.length && setIsMenuOpen(false)}
                                                            >
                                                                {child.label}
                                                            </a>
                                                            {grandchildren.length > 0 && (
                                                                <button
                                                                    onClick={() => setMobileOpenChild(childOpen ? null : (child.id ?? null))}
                                                                    className={`w-8 h-8 flex items-center justify-center transition-all ${childOpen ? 'text-primary' : 'text-slate-300'}`}
                                                                >
                                                                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${childOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {grandchildren.length > 0 && childOpen && (
                                                            <div className="flex flex-col gap-3 pl-4 pt-1 mb-2">
                                                                {grandchildren.map((gc) => (
                                                                    <a
                                                                        key={`g-${gc.id}`}
                                                                        href={gc.href}
                                                                        className={`text-[13px] transition-all flex items-center gap-2 ${isActive(gc.href) ? 'text-primary font-bold' : 'text-slate-400 hover:text-primary'}`}
                                                                        onClick={() => setIsMenuOpen(false)}
                                                                    >
                                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
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
                                className={`flex items-center justify-center rounded-lg h-12 px-6 mt-6 bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98]`}
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
