import { connectDB } from '@/db';
import { User } from '@/db/schema';
import { Quotations } from '@/db/quotationsSchema';
import { Quotation } from '@/types/quotation';

export async function readAll(): Promise<Quotation[]> {
    await connectDB();
    const list = await Quotations.find().sort({ createdAt: -1 }).lean();
    return (list as any[]).map(q => ({ ...q, id: q._id.toString() }));
}

export async function createQuotation(q: Quotation): Promise<Quotation> {
    await connectDB();

    // Auto-generate number if not provided
    let number = q.number;
    if (!number) {
        const count = await Quotations.countDocuments();
        number = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    const item = await Quotations.create({
        ...q,
        number,
        status: q.status || 'draft',
    });

    const obj = item.toObject();
    return { ...obj, id: obj._id.toString() };
}

export async function updateQuotation(id: string | number, q: Partial<Quotation>): Promise<Quotation | null> {
    await connectDB();
    // In Mongoose version, ID is a string (ObjectId)
    const updated = await Quotations.findByIdAndUpdate(id, q, { new: true }).lean();
    if (!updated) return null;
    return { ...updated, id: (updated as any)._id.toString() };
}

export async function deleteQuotation(id: string | number): Promise<boolean> {
    await connectDB();
    const result = await Quotations.findByIdAndDelete(id);
    return !!result;
}

export async function findById(id: string | number): Promise<Quotation | null> {
    try {
        await connectDB();
        // Try searching by ID first
        let q = await Quotations.findById(id).populate('created_by', 'name signature').lean();

        // If not found by ID, try searching by quotation number as a fallback
        if (!q) {
            q = await Quotations.findOne({ number: id }).populate('created_by', 'name signature').lean();
        }

        if (!q) return null;
        return { ...q, id: (q as any)._id.toString() } as any;
    } catch (error) {
        console.error('Error in findById:', error);
        return null;
    }
}
