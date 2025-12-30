import fs from 'fs/promises';
import path from 'path';
import { Quotation } from '@/types/quotation';

const DATA_FILE = path.join(process.cwd(), 'data', 'quotations.json');

async function ensureDataFile() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.access(DATA_FILE);
    } catch (err) {
        await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    }
}

export async function readAll(): Promise<Quotation[]> {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(raw || '[]');
    } catch (e) {
        return [];
    }
}

export async function writeAll(list: Quotation[]) {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

export async function createQuotation(q: Quotation): Promise<Quotation> {
    const list = await readAll();
    const id = list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1;
    const number = q.number || `QT-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const item: Quotation = { ...q, id, number, createdAt: now, updatedAt: now };
    list.push(item);
    await writeAll(list);
    return item;
}

export async function updateQuotation(id: number, q: Partial<Quotation>): Promise<Quotation | null> {
    const list = await readAll();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return null;
    const updated: Quotation = { ...list[idx], ...q, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    await writeAll(list);
    return updated;
}

export async function deleteQuotation(id: number): Promise<boolean> {
    const list = await readAll();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    await writeAll(list);
    return true;
}

export async function findById(id: number): Promise<Quotation | null> {
    const list = await readAll();
    return list.find(x => x.id === id) || null;
}
