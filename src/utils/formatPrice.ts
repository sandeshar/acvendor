export function parsePriceNumber(value: any): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'object') {
        if ('$numberDecimal' in value) return Number(value['$numberDecimal'] || 0);
        // If it's a Decimal128-like with toString
        if (typeof value.toString === 'function') {
            const s = value.toString();
            if (s && s !== '[object Object]') {
                const n = Number(s);
                return isNaN(n) ? 0 : n;
            }
        }
        return 0;
    }
    if (typeof value === 'string') {
        // strip non-numeric except dot and minus
        const s = value.replace(/[^0-9.-]+/g, '') || '0';
        const n = Number(s);
        return isNaN(n) ? 0 : n;
    }
    return 0;
}

export function formatPrice(value: any, opts?: { minimumFractionDigits?: number, maximumFractionDigits?: number }): string {
    if (value == null || value === '') return '';
    const n = parsePriceNumber(value);
    if (!isFinite(n)) return String(value);
    const isInt = n % 1 === 0;
    if (isInt) return n.toLocaleString();
    return n.toLocaleString(undefined, { minimumFractionDigits: opts?.minimumFractionDigits ?? 2, maximumFractionDigits: opts?.maximumFractionDigits ?? 2 });
}
