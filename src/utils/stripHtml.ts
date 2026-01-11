export function stripHtml(html?: string | null): string {
    if (!html) return '';
    // Remove HTML tags and normalize whitespace
    const stripped = String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim();
    return stripped;
}
