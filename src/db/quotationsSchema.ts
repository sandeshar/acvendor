import mongoose, { Schema, model, models } from 'mongoose';

const quotationItemSchema = new Schema({
    description: { type: String, required: true },
    qty: { type: Schema.Types.Mixed, required: true }, // number or string
    unitPrice: { type: Schema.Types.Mixed, required: true }, // number or string
    discountPercent: { type: Schema.Types.Mixed, default: 0 },
});

const clientInfoSchema = new Schema({
    name: { type: String },
    company: { type: String },
    address: { type: String },
    pan: { type: String },
    email: { type: String },
    phone: { type: String },
});

const quotationSchema = new Schema({
    number: { type: String, required: true, unique: true },
    status: { type: String, enum: ['draft', 'sent', 'cancelled'], default: 'draft' },
    client: { type: clientInfoSchema },
    dateIssued: { type: String },
    validUntil: { type: String },
    referenceNo: { type: String },
    items: [quotationItemSchema],
    notes: { type: String },
    include_signature: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    totals: {
        subtotal: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
    collection: 'quotations'
});

export const Quotations = models.Quotations || model('Quotations', quotationSchema);
