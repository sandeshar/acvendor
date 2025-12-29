'use client'
import { useState, useEffect } from 'react';

const SideBar = () => {
    const [isUIOpen, setIsUIOpen] = useState(false);
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

    const mainItems = [
        { name: 'Dashboard', icon: 'dashboard', href: '/admin' },
        { name: 'Store Setting', icon: 'settings', href: '/admin/store-setting' },
        { name: 'Users', icon: 'group', href: '/admin/users' },
        { name: 'Services Manager', icon: 'service_toolbox', href: '/admin/services/manager' },
        { name: 'Category Manager', icon: 'category', href: '/admin/categories' },
        { name: 'Products', icon: 'inventory_2', href: '/admin/products' },
        { name: 'Shop', icon: 'store', href: '/admin/shop' },
        { name: 'Testimonials', icon: 'reviews', href: '/admin/testimonials' },
        { name: 'Contact', icon: 'contact_mail', href: '/admin/contact' },
    ];

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
    ];

    return (
        <aside className="admin-sidebar hidden md:flex sticky top-0 h-screen max-h-screen w-64 min-w-64 shrink-0 flex-col justify-between border-r border-gray-700 bg-gray-900 p-4 shadow-sm overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>database</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white text-base font-bold leading-normal">{siteName}</h1>
                        <p className="text-gray-400 text-sm font-normal leading-normal">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {mainItems.map((item) => (
                        <a key={item.name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" href={item.href}>
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <p className="text-sm font-medium leading-normal">{item.name}</p>
                        </a>
                    ))}

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