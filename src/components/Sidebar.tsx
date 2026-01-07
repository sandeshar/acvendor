'use client'
import { useState, useEffect } from 'react';

const SideBar = () => {
    const [isUIOpen, setIsUIOpen] = useState(false);
    const [isSEOOpen, setIsSEOOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);
    const [isContentOpen, setIsContentOpen] = useState(false);
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



    const seoItems = [
        { name: 'Sitemap', icon: 'map', href: '/admin/seo/sitemap' },
        { name: 'Robots.txt', icon: 'smart_toy', href: '/admin/seo/robots' },
    ];

    const uiSubItems = [
        { name: 'Navbar', icon: 'menu', href: '/admin/navbar' },
        { name: 'Footer', icon: 'web', href: '/admin/footer' },
        { name: 'Home', icon: 'home', href: '/admin/ui/home' },
        { name: 'About', icon: 'info', href: '/admin/ui/about' },
        { name: 'Contact', icon: 'contact_mail', href: '/admin/ui/contact' },
        { name: 'FaQ', icon: 'help_outline', href: '/admin/ui/faq' },
        { name: 'Terms and Conditions', icon: 'description', href: '/admin/ui/termsandconditions' },
        { name: 'Projects', icon: 'architecture', href: '/admin/projects' },
    ];

    return (
        <aside className="admin-sidebar hidden md:flex sticky top-0 h-screen max-h-screen w-64 min-w-64 shrink-0 flex-col justify-between border-r border-gray-700 bg-gray-900 p-4 shadow-sm overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3 px-2">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>database</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-bold leading-normal">{siteName}</h1>
                            <p className="text-gray-400 text-sm font-normal leading-normal">Admin Panel</p>
                        </div>
                    </div>


                </div>
                <nav className="flex flex-col gap-2">
                    {/* Manage (top-level links, not a dropdown) */}
                    <div className="flex flex-col gap-1 pl-0 mt-1">
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" href="/admin">
                            <span className="material-symbols-outlined text-base">dashboard</span>
                            <p className="text-sm font-medium leading-normal">Dashboard</p>
                        </a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" href="/admin/users">
                            <span className="material-symbols-outlined text-base">group</span>
                            <p className="text-sm font-medium leading-normal">Users</p>
                        </a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" href="/admin/store-setting">
                            <span className="material-symbols-outlined text-base">settings</span>
                            <p className="text-sm font-medium leading-normal">Store Setting</p>
                        </a>
                    </div>

                    {/* Catalog group */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 w-full"
                        >
                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                            <p className="text-sm font-medium leading-normal flex-1 text-left">Catalog</p>
                            <span className={`material-symbols-outlined text-lg transition-transform ${isCatalogOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isCatalogOpen && (
                            <div className="flex flex-col gap-1 pl-6 mt-1">
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/products">
                                    <span className="material-symbols-outlined text-base">inventory_2</span>
                                    <p className="text-xs font-medium leading-normal">Products</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/quotation/drafts">
                                    <span className="material-symbols-outlined text-base">request_quote</span>
                                    <p className="text-xs font-medium leading-normal">Quotations</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/shop">
                                    <span className="material-symbols-outlined text-base">store</span>
                                    <p className="text-xs font-medium leading-normal">Shop</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/contact">
                                    <span className="material-symbols-outlined text-base">contact_mail</span>
                                    <p className="text-xs font-medium leading-normal">Contact</p>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Content group */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setIsContentOpen(!isContentOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 w-full"
                        >
                            <span className="material-symbols-outlined text-lg">article</span>
                            <p className="text-sm font-medium leading-normal flex-1 text-left">Content</p>
                            <span className={`material-symbols-outlined text-lg transition-transform ${isContentOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isContentOpen && (
                            <div className="flex flex-col gap-1 pl-6 mt-1">
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/blog">
                                    <span className="material-symbols-outlined text-base">article</span>
                                    <p className="text-xs font-medium leading-normal">Blog</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/testimonials">
                                    <span className="material-symbols-outlined text-base">reviews</span>
                                    <p className="text-xs font-medium leading-normal">Testimonials</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/projects">
                                    <span className="material-symbols-outlined text-base">architecture</span>
                                    <p className="text-xs font-medium leading-normal">Projects</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/services/manager">
                                    <span className="material-symbols-outlined text-base">service_toolbox</span>
                                    <p className="text-xs font-medium leading-normal">Services Manager</p>
                                </a>
                                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href="/admin/categories">
                                    <span className="material-symbols-outlined text-base">category</span>
                                    <p className="text-xs font-medium leading-normal">Category Manager</p>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* SEO Tools with sub-navigation */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setIsSEOOpen(!isSEOOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 w-full"
                        >
                            <span className="material-symbols-outlined text-lg">search</span>
                            <p className="text-sm font-medium leading-normal flex-1 text-left">SEO Tools</p>
                            <span className={`material-symbols-outlined text-lg transition-transform ${isSEOOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isSEOOpen && (
                            <div className="flex flex-col gap-1 pl-6 mt-1">
                                {seoItems.map((item) => (
                                    <a key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href={item.href}>
                                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                                        <p className="text-xs font-medium leading-normal">{item.name}</p>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* UI Elements with sub-navigation */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setIsUIOpen(!isUIOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 w-full"
                        >
                            <span className="material-symbols-outlined text-lg">widgets</span>
                            <p className="text-sm font-medium leading-normal flex-1 text-left">UI Elements</p>
                            <span className={`material-symbols-outlined text-lg transition-transform ${isUIOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isUIOpen && (
                            <div className="flex flex-col gap-1 pl-6 mt-1">
                                {uiSubItems.map((item) => (
                                    <a key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 text-sm" href={item.href}>
                                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                                        <p className="text-xs font-medium leading-normal">{item.name}</p>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>
            </div>
            <div className="flex flex-col gap-1 border-t border-gray-700 pt-4">
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
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 w-full text-left"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <p className="text-sm font-medium leading-normal">Logout</p>
                </button>
            </div>
        </aside>
    );
};

export default SideBar;