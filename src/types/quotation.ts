export type QuotationItem = {
    id?: number;
    description: string;
    qty: number | string;
    unitPrice: number | string;
    discountPercent?: number | string; // percent
};

export type ClientInfo = {
    name?: string;
    company?: string;
    address?: string;
    pan?: string;
    email?: string;
    phone?: string;
};

export type Quotation = {
    id?: number;
    number?: string; // human readable like QT-2025-001
    status?: 'draft' | 'sent' | 'cancelled';
    client?: ClientInfo;
    dateIssued?: string;
    validUntil?: string;
    referenceNo?: string;
    items?: QuotationItem[];
    notes?: string;
    totals?: {
        subtotal: number;
        discount: number;
        tax: number;
        grandTotal: number;
    };
    createdAt?: string;
    updatedAt?: string;
};