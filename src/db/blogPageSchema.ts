import mongoose, { Schema, model, models } from 'mongoose';

// Blog Page Hero Section
const blogPageHeroSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    subtitle: { type: String, required: true, maxlength: 512 },
    background_image: { type: String, required: true, maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, { 
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'blog_page_hero'
});

export const BlogPageHero = models.BlogPageHero || model('BlogPageHero', blogPageHeroSchema);

// Blog Page CTA Section
const blogPageCTASchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    button_text: { type: String, required: true, maxlength: 100 },
    is_active: { type: Number, default: 1, required: true },
}, { 
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'blog_page_cta'
});

export const BlogPageCTA = models.BlogPageCTA || model('BlogPageCTA', blogPageCTASchema);

// Backward compatibility exports (camelCase for existing API code)
export const blogPageHero = BlogPageHero;
export const blogPageCTA = BlogPageCTA;
