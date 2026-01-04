import { Status } from '@/db/schema';

// Map numeric status codes to Status names used in DB
const STATUS_MAP: Record<number, string> = {
    1: 'Draft',
    2: 'Published',
    3: 'In Review',
};

export async function resolveStatusId(status: number | string | any) {
    // If status is falsy, return null
    if (!status && status !== 0) return null;

    // If it's already an ObjectId-like (string of 24 hex chars), return as-is
    if (typeof status === 'string' && /^[a-fA-F0-9]{24}$/.test(status)) return status;

    // If it's an object with _id, return that
    if (typeof status === 'object' && status?._id) return String(status._id);

    // If it's a number, map to name and resolve
    if (typeof status === 'number') {
        const name = STATUS_MAP[status];
        if (!name) return null;
        const doc = await Status.findOne({ name }).lean();
        return doc ? String(doc._id) : null;
    }

    // If it's a string like 'published' or 'draft', try to map case-insensitively
    if (typeof status === 'string') {
        const normalized = status.trim().toLowerCase();
        const name = Object.values(STATUS_MAP).find(v => v.toLowerCase() === normalized);
        if (name) {
            const doc = await Status.findOne({ name }).lean();
            return doc ? String(doc._id) : null;
        }
    }

    return null;
}

export async function statusNameToNumeric(statusIdOrDoc: string | any) {
    // Accept either ObjectId string or a status document
    let name: string | undefined;
    if (!statusIdOrDoc) return null;
    if (typeof statusIdOrDoc === 'object' && statusIdOrDoc?.name) name = statusIdOrDoc.name;
    else if (typeof statusIdOrDoc === 'string') {
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(statusIdOrDoc);
        if (isObjectId) {
            const doc = await Status.findById(statusIdOrDoc).lean();
            name = doc?.name;
        } else {
            name = statusIdOrDoc;
        }
    }

    if (!name) return null;
    const lower = name.toLowerCase();
    for (const [num, n] of Object.entries(STATUS_MAP)) {
        if (n.toLowerCase() === lower) return Number(num);
    }
    return null;
}