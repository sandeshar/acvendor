import mongoose, { Schema, model, models } from 'mongoose';

// FAQ Page Header Section
const faqPageHeaderSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    search_placeholder: { type: String, required: true, maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'faq_page_header'
});

export const FAQPageHeader = models.FAQPageHeader || model('FAQPageHeader', faqPageHeaderSchema);

// FAQ Categories
const faqCategoriesSchema = new Schema({
    name: { type: String, required: true, unique: true, maxlength: 100 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'faq_categories'
});

export const FAQCategories = models.FAQCategories || model('FAQCategories', faqCategoriesSchema);

// FAQ Items
const faqItemsSchema = new Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'FAQCategories', required: true },
    question: { type: String, required: true, maxlength: 512 },
    answer: { type: String, required: true, maxlength: 2048 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'faq_items'
});

export const FAQItems = models.FAQItems || model('FAQItems', faqItemsSchema);

// FAQ Page CTA Section
const faqPageCTASchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    button_text: { type: String, required: true, maxlength: 100 },
    button_link: { type: String, required: true, maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'faq_page_cta'
});

export const FAQPageCTA = models.FAQPageCTA || model('FAQPageCTA', faqPageCTASchema);

// Backward compatibility exports (camelCase for existing API code)
export const faqPageHeader = FAQPageHeader;
export const faqCategories = FAQCategories;
export const faqItems = FAQItems;
export const faqPageCTA = FAQPageCTA;
