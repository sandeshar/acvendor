// Helper to get all frontend page routes dynamically
export const frontendPages = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/services', name: 'Services' },
    { path: '/contact', name: 'Contact' },
    { path: '/faq', name: 'FAQ' },
    { path: '/terms', name: 'Terms and Conditions' },
];

export function getFrontendPageCount(): number {
    return frontendPages.length;
}

export function getFrontendPaths(): string[] {
    return frontendPages.map(p => p.path);
}
