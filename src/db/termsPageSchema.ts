import mongoose, { Schema, model, models } from 'mongoose';

// Terms Page Header
const termsPageHeaderSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    last_updated: { type: String, required: true, maxlength: 100 },
    is_active: { type: Number, default: 1, required: true },
}, { 
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'terms_page_header'
});

export const TermsPageHeader = models.TermsPageHeader || model('TermsPageHeader', termsPageHeaderSchema);

// Terms Page Sections
const termsPageSectionsSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    content: { type: String, required: true, maxlength: 5000 },
    has_email: { type: Number, default: 0, required: true },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, { 
    timestamps: true,
    collection: 'terms_page_sections'
});

export const TermsPageSections = models.TermsPageSections || model('TermsPageSections', termsPageSectionsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const termsPageHeader = TermsPageHeader;
export const termsPageSections = TermsPageSections;
