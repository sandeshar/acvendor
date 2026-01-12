export function normalizeSlug(text: string) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: any, maxLen = 256) {
    if (typeof slug !== 'string') return false;
    if (!slug.length) return false;
    if (slug.length > maxLen) return false;
    // allow lower-case letters, numbers, and hyphen-separated words
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export default isValidSlug;
