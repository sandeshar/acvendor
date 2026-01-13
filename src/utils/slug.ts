export function normalizeSlug(text: string) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: any, maxLen = 256) {
    if (typeof slug !== 'string') return false;
    if (!slug.length) return false;
    if (slug.length > maxLen) return false;
    // allow alphanumeric, underscore, and hyphen
    return /^[a-zA-Z0-9_-]+$/.test(slug);
}

export default isValidSlug;
