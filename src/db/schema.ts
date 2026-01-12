import mongoose, { Schema, model, models } from 'mongoose';

// Users Schema
const userSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    email: { type: String, required: true, unique: true, maxlength: 256 },
    password: { type: String, required: true, maxlength: 512 },
    role: { type: String, required: true, default: 'admin', maxlength: 50 },
}, {
    timestamps: true,
    collection: 'users'
});

export const User = models.User || model('User', userSchema);

// Status Schema
const statusSchema = new Schema({
    name: { type: String, required: true, unique: true, maxlength: 50 },
}, {
    timestamps: true,
    collection: 'status'
});

export const Status = models.Status || model('Status', statusSchema);

// Blog Posts Schema
const blogPostSchema = new Schema({
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    title: { type: String, required: true, maxlength: 512 },
    content: { type: String, required: true, maxlength: 65535 },
    tags: { type: String, maxlength: 512, default: '' },
    thumbnail: { type: String, maxlength: 512, default: '' },
    metaTitle: { type: String, maxlength: 256, default: '' },
    metaDescription: { type: String, maxlength: 512, default: '' },
    // Category (optional): links to `blog_categories`
    category_id: { type: Schema.Types.ObjectId, ref: 'BlogCategories', default: null },
    category_name: { type: String, maxlength: 256, default: '' },
    category_slug: { type: String, maxlength: 256, default: '' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Schema.Types.ObjectId, ref: 'Status', required: true },
}, {
    timestamps: true,
    collection: 'blog_posts'
});

export const BlogPost = models.BlogPost || model('BlogPost', blogPostSchema);

// Store Settings Schema
const storeSettingsSchema = new Schema({
    store_name: { type: String, required: true, maxlength: 256 },
    store_description: { type: String, required: true, maxlength: 1024 },
    store_logo: { type: String, required: true, maxlength: 512 },
    logo_size: { type: String, required: false, default: 'small', maxlength: 20 },
    favicon: { type: String, required: true, maxlength: 512 },
    contact_email: { type: String, required: true, maxlength: 256 },
    contact_phone: { type: String, required: true, maxlength: 50 },
    address: { type: String, required: true, maxlength: 512 },
    // PAN (tax id) for corporate documents
    pan: { type: String, required: true, default: '', maxlength: 128 },
    // Authorized signatory name for printed documents
    authorized_person: { type: String, required: true, default: '', maxlength: 256 },
    facebook: { type: String, required: true, maxlength: 512 },
    twitter: { type: String, required: true, maxlength: 512 },
    instagram: { type: String, required: true, maxlength: 512 },
    linkedin: { type: String, required: true, maxlength: 512 },
    meta_title: { type: String, required: true, maxlength: 256 },
    meta_description: { type: String, required: true, maxlength: 512 },
    meta_keywords: { type: String, required: true, maxlength: 512 },
    footer_text: { type: String, required: true, maxlength: 512 },
    // Theme selection for the site (e.g., light, dark, ocean, corporate)
    theme: { type: String, required: true, default: 'light', maxlength: 100 },
    // Optional featured brand identifier used by the storefront (e.g., 'midea')
    featured_brand: { type: String, required: true, default: '', maxlength: 128 },
    // Whether to remove the site name entirely (all screens)
    hide_site_name: { type: Number, default: 0, required: true },
    // Whether to hide the site name on small screens (mobile)
    hide_site_name_on_mobile: { type: Number, default: 0, required: true },
    // Whether to hide the store name in the footer
    hide_store_name_in_footer: { type: Number, default: 0, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'store_settings'
});

export const StoreSettings = models.StoreSettings || model('StoreSettings', storeSettingsSchema);

// Footer Sections Schema
const footerSectionSchema = new Schema({
    store_id: { type: Schema.Types.ObjectId, ref: 'StoreSettings' },
    title: { type: String, required: true, maxlength: 128 },
    order: { type: Number, default: 0, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'footer_sections'
});

export const FooterSection = models.FooterSection || model('FooterSection', footerSectionSchema);

// Footer Links Schema
const footerLinkSchema = new Schema({
    section_id: { type: Schema.Types.ObjectId, ref: 'FooterSection', required: true },
    label: { type: String, required: true, maxlength: 256 },
    href: { type: String, required: true, maxlength: 512 },
    is_external: { type: Number, default: 0, required: true },
    order: { type: Number, default: 0, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'footer_links'
});

export const FooterLink = models.FooterLink || model('FooterLink', footerLinkSchema);

// Backward compatibility exports (camelCase for existing API code)
export const users = User;
export const status = Status;
export const blogPosts = BlogPost;
export const storeSettings = StoreSettings;
export const footerSections = FooterSection;
export const footerLinks = FooterLink;
