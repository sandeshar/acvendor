'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SideBar = () => {
    const pathname = usePathname();
    const [isUIOpen, setIsUIOpen] = useState(false);
    const [isPagesOpen, setIsPagesOpen] = useState(false);
    const [isBlogOpen, setIsBlogOpen] = useState(false);
    const [isSEOOpen, setIsSEOOpen] = useState(false);
    const [siteName, setSiteName] = useState('Admin Panel');

    useEffect(() => {
        const fetchSiteName = async () => {
            try {
                // Use no-store to avoid cached values and handle the API payload shape { success, data }
                const response = await fetch('/api/store-settings', { cache: 'no-store' });
                if (response.ok) {
                    const payload = await response.json();
                    const s = payload?.data || payload;
                    const name = s?.storeName || s?.store_name || '';
                    if (name) {
                        setSiteName(name);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch site name:', error);
            }
        };
        fetchSiteName();
    }, []);

    // Effect to open dropdowns if a child is active
    useEffect(() => {
        if (uiSubItems.some(item => pathname === item.href)) setIsUIOpen(true);
        if (pageSubItems.some(item => pathname === item.href)) setIsPagesOpen(true);
        if (blogSubItems.some(item => pathname === item.href)) setIsBlogOpen(true);
        if (seoItems.some(item => pathname === item.href)) setIsSEOOpen(true);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;



    const uiSubItems = [
        { name: 'Shop Front', icon: 'storefront', href: '/admin/shop' },
        { name: 'Navbar', icon: 'menu', href: '/admin/navbar' },
        { name: 'Footer', icon: 'web', href: '/admin/footer' },
    ];

    const pageSubItems = [
        { name: 'Home Page', icon: 'home', href: '/admin/ui/home' },
        { name: 'About Page', icon: 'info', href: '/admin/ui/about' },
        { name: 'Contact Page', icon: 'contact_mail', href: '/admin/ui/contact' },
        { name: 'FaQ Page', icon: 'help_outline', href: '/admin/ui/faq' },
        { name: 'Terms & Conditions', icon: 'description', href: '/admin/ui/termsandconditions' },
    ];

    const blogSubItems = [
        { name: 'Blog Posts', icon: 'edit_note', href: '/admin/blog' },
        { name: 'Blog Categories', icon: 'category', href: '/admin/blog/categories' },
    ];

    const seoItems = [
        { name: 'Sitemap', icon: 'map', href: '/admin/seo/sitemap' },
        { name: 'Robots.txt', icon: 'smart_toy', href: '/admin/seo/robots' },
    ];

    return (
        <aside className="admin-sidebar hidden md:flex sticky top-0 h-screen max-h-screen w-64 min-w-64 shrink-0 flex-col justify-between border-r border-gray-800 bg-gray-950 shadow-2xl overflow-y-auto overflow-x-hidden transition-all duration-300">
            <div className="flex flex-col mb-10">
                {/* Branding Section */}
                <div className="flex flex-col gap-3 px-6 py-8 border-b border-gray-800/50 bg-gray-950/50 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-white/10">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>admin_panel_settings</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-white text-[15px] font-bold leading-tight truncate">{siteName}</h1>
                            <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider leading-tight">Control Center</p>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col gap-1.5 p-4">
                    {/* Core Section */}
                    <div className="flex flex-col gap-1">
                        <NavItem href="/admin" icon="grid_view" label="Dashboard" active={isActive('/admin')} />
                        <NavItem href="/admin/users" icon="group" label="Users" active={isActive('/admin/users')} />
                        <NavItem href="/admin/store-setting" icon="settings" label="Store Settings" active={isActive('/admin/store-setting')} />
                    </div>

                    <SectionHeader title="Catalog & Sales" />
                    <div className="flex flex-col gap-1">
                        <NavItem href="/admin/products" icon="inventory_2" label="Products" active={isActive('/admin/products')} />
                        <NavItem href="/admin/products/featured" icon="star" label="Featured Products" active={isActive('/admin/products/featured')} />
                        <NavItem href="/admin/categories" icon="category" label="Product Categories" active={isActive('/admin/categories')} />
                        {/* <NavItem href="/admin/brands" icon="branding_watermark" label="Brands" active={isActive('/admin/brands')} /> */}
                        <NavItem href="/admin/quotation/drafts" icon="receipt_long" label="Quotations" active={isActive('/admin/quotation/drafts')} />
                        <NavItem href="/admin/contact" icon="mail" label="Customer Inquiries" active={isActive('/admin/contact')} />                    </div>

                    <SectionHeader title="Content & Stories" />
                    <div className="flex flex-col gap-1">
                        <DropdownMenu
                            label="Blog"
                            icon="edit_note"
                            isOpen={isBlogOpen}
                            setIsOpen={setIsBlogOpen}
                            items={blogSubItems}
                            pathname={pathname}
                        />
                        <NavItem href="/admin/services/manager" icon="design_services" label="Services" active={isActive('/admin/services/manager')} />
                        <NavItem href="/admin/projects" icon="campaign" label="Projects" active={isActive('/admin/projects')} />
                        <NavItem href="/admin/testimonials" icon="forum" label="Testimonials" active={isActive('/admin/testimonials')} />
                    </div>

                    <SectionHeader title="Site Configuration" />
                    <div className="flex flex-col gap-1">
                        <DropdownMenu
                            label="UI Elements"
                            icon="draw"
                            isOpen={isUIOpen}
                            setIsOpen={setIsUIOpen}
                            items={uiSubItems}
                            pathname={pathname}
                        />
                        <DropdownMenu
                            label="Pages"
                            icon="auto_stories"
                            isOpen={isPagesOpen}
                            setIsOpen={setIsPagesOpen}
                            items={pageSubItems}
                            pathname={pathname}
                        />
                        <DropdownMenu
                            label="SEO Presence"
                            icon="travel_explore"
                            isOpen={isSEOOpen}
                            setIsOpen={setIsSEOOpen}
                            items={seoItems}
                            pathname={pathname}
                        />
                    </div>
                </nav>
            </div>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/80 sticky bottom-0 backdrop-blur-md">
                <button
                    onClick={async () => {
                        try {
                            const response = await fetch('/api/logout', { method: 'POST' });
                            if (response.ok) {
                                window.location.href = '/login';
                            }
                        } catch (error) {
                            console.error('Logout failed:', error);
                        }
                    }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full group"
                >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">power_settings_new</span>
                    <p className="text-sm font-bold">Logout Session</p>
                </button>
            </div>
        </aside>
    );
};

const SectionHeader = ({ title }: { title: string }) => (
    <div className="mt-8 mb-2 px-4 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600/80">{title}</span>
        <div className="h-[1px] flex-1 bg-gray-800/50" />
    </div>
);

const NavItem = ({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) => (
    <Link
        href={href}
        className={`relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 group ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-white/10'
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
            }`}
    >
        <span className={`material-symbols-outlined text-[22px] ${active ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
        {active && <div className="absolute right-3 size-1.5 rounded-full bg-white animate-pulse" />}
    </Link>
);

const DropdownMenu = ({ label, icon, isOpen, setIsOpen, items, pathname }: any) => {
    const isAnyActive = items.some((item: any) => pathname === item.href);

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 group w-full ${isAnyActive && !isOpen ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
                    }`}
            >
                <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">{icon}</span>
                <p className="text-sm font-semibold flex-1 text-left">{label}</p>
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-500 ${isOpen ? 'rotate-180 text-gray-200' : 'text-gray-600'}`}>
                    expand_more
                </span>
            </button>

            <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[600px] mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-l border-gray-800/60 ml-7 pl-4 flex flex-col gap-1 my-1">
                    {items.map((item: any) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group ${pathname === item.href
                                ? 'text-white bg-white/10 font-bold'
                                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${pathname === item.href ? 'text-primary' : 'group-hover:text-gray-300'}`}>{item.icon}</span>
                            <span className="text-[13px]">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SideBar;