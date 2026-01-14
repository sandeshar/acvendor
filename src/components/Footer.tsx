interface FooterProps {
    storeName: string;
    storeLogo?: string;
    store?: any;
}

const footerLinks = [
    {
        title: 'Shop',
        links: [
            { label: 'Air Conditioners', href: '/shop' },
            { label: 'Home Appliances', href: '/shop' },
            { label: 'Spare Parts', href: '/shop' },
            { label: 'Accessories', href: '/shop' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Terms', href: '/terms' },
        ],
    },

];

const Footer = ({ storeName, storeLogo, store }: FooterProps) => {
    const baseSections = (store?.footerSections && Array.isArray(store.footerSections) && store.footerSections.length) ? store.footerSections : footerLinks;
    // If the store has social links but no 'Connect' section defined, synthesize it so social icons show
    const sections = (() => {
        const s = Array.isArray(baseSections) ? [...baseSections] : [];
        const hasConnect = s.some((sec) => (sec?.title || '').toLowerCase() === 'connect');
        if (!hasConnect && (store?.facebook || store?.twitter || store?.instagram || store?.linkedin)) {
            s.push({ title: 'Connect', links: [] });
        }
        return s;
    })();

    return (
        <footer className="bg-primary text-white border-t border-white/10">
            <div className="max-w-7xl mx-auto py-12 px-4 md:px-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex flex-col gap-2">
                            {(store?.footerLogo || storeLogo) ? (
                                <img
                                    src={store?.footerLogo || storeLogo}
                                    alt={storeName}
                                    className={`${store?.footerLogoSize === 'large' ? 'h-16' :
                                        store?.footerLogoSize === 'small' ? 'h-9' :
                                            'h-12'
                                        } w-auto object-contain rounded`}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-white text-2xl">hub</span>
                            )}
                            {!store?.hideStoreNameInFooter && (
                                <h2 className="text-base font-bold text-white">{storeName}</h2>
                            )}
                        </div>
                        <p className="mt-4 text-sm text-white/70">
                            {store?.storeDescription || store?.store_description || 'Crafting content that converts.'}
                        </p>

                        {/* Contact info */}
                        {(store?.contactEmail || store?.contactPhone || store?.address) ? (
                            <div className="mt-4 text-sm text-white/70">
                                {store?.contactEmail && <div>Email: <a className="text-white hover:underline" href={`mailto:${store.contactEmail}`}>{store.contactEmail}</a></div>}
                                {store?.contactPhone && <div>Phone: <a className="text-white hover:underline" href={`tel:${store.contactPhone}`}>{store.contactPhone}</a></div>}
                                {store?.address && (
                                    <div>Address: <a className="text-white hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`} target="_blank" rel="noreferrer">{store.address}</a></div>
                                )}
                            </div>
                        ) : null}
                    </div>
                    {sections.map((section: any) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                                {section.title}
                            </h3>
                            <ul className="mt-4 space-y-2">
                                {section.title === 'Connect' ? (
                                    // Render social links from store settings when available
                                    (store?.facebook || store?.twitter || store?.instagram || store?.linkedin) ? (
                                        <>
                                            <li className="flex items-center gap-3">
                                                {store?.twitter && (
                                                    <a key="twitter" href={store.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="p-2 rounded hover:bg-white/10 transition-colors text-white/70">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.2 4.2 0 0 0 1.85-2.32c-.82.48-1.73.83-2.7 1.02A4.17 4.17 0 0 0 16.1 4c-2.3 0-4.16 1.86-4.16 4.16 0 .33.04.65.1.96-3.46-.17-6.53-1.83-8.59-4.35a4.1 4.1 0 0 0-.56 2.09c0 1.44.73 2.7 1.84 3.45-.68-.02-1.32-.21-1.88-.52v.05c0 2.02 1.44 3.7 3.36 4.09-.35.1-.72.15-1.1.15-.27 0-.54-.03-.79-.08.54 1.69 2.1 2.92 3.95 2.95A8.36 8.36 0 0 1 2 19.54 11.78 11.78 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53A8.3 8.3 0 0 0 22.46 6z" />
                                                        </svg>
                                                        <span className="sr-only">Twitter</span>
                                                    </a>
                                                )}

                                                {store?.linkedin && (
                                                    <a key="linkedin" href={store.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="p-2 rounded hover:bg-white/10 transition-colors text-white/70">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8.98h4.48V24H.24zM9.54 8.98h4.29v2.06h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V24h-4.48v-7.44c0-1.77-.03-4.04-2.46-4.04-2.47 0-2.85 1.93-2.85 3.92V24H9.54z" />
                                                        </svg>
                                                        <span className="sr-only">LinkedIn</span>
                                                    </a>
                                                )}

                                                {store?.facebook && (
                                                    <a key="facebook" href={store.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded hover:bg-white/10 transition-colors text-white/70">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H8.9V12h1.6V9.8c0-1.57.93-2.44 2.36-2.44.68 0 1.39.12 1.39.12v1.53h-.78c-.77 0-1.01.48-1.01.97V12h1.72l-.28 2.88h-1.44v6.99A10 10 0 0 0 22 12" />
                                                        </svg>
                                                        <span className="sr-only">Facebook</span>
                                                    </a>
                                                )}

                                                {store?.instagram && (
                                                    <a key="instagram" href={store.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 rounded hover:bg-white/10 transition-colors text-white/70">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm8.5 4.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                                                        </svg>
                                                        <span className="sr-only">Instagram</span>
                                                    </a>
                                                )}
                                            </li>
                                        </>
                                    ) : (
                                        section.links.map((link: any) => (
                                            <li key={link.label}>
                                                <a className="text-sm text-white/70 hover:text-white transition-colors" href={link.href}>{link.label}</a>
                                            </li>
                                        ))
                                    )
                                ) : (
                                    section.links.map((link: any) => (
                                        <li key={link.label}>
                                            <a className="text-sm text-white/70 hover:text-white transition-colors" href={link.href}>{link.label}</a>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-sm text-white/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                        <div className="text-center md:text-left">
                            {store?.footerText || store?.footer_text ? (
                                <p className="mb-0">{store?.footerText || store?.footer_text}</p>
                            ) : null}
                        </div>
                        <div className="text-center md:text-right">
                            <p className="mb-0" suppressHydrationWarning={true}>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;