import mongoose, { Schema, model, models } from 'mongoose';

// Blog Categories
const blogCategoriesSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    description: { type: String, default: '' },
    thumbnail: { type: String, maxlength: 512, default: '' },
    display_order: { type: Number, default: 0, required: true },
    is_active: { type: Number, default: 1, required: true },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
}, {
    timestamps: true,
    collection: 'blog_categories'
});

export const BlogCategories = models.BlogCategories || model('BlogCategories', blogCategoriesSchema);

// Backwards compatible export
export const blogCategories = BlogCategories;
