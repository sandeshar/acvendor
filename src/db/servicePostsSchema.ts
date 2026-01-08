import mongoose, { Schema, model, models } from 'mongoose';

// Individual Service Posts (like blog posts)
const servicePostsSchema = new Schema({
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    title: { type: String, required: true, maxlength: 512 },
    excerpt: { type: String, required: true, maxlength: 512 },
    content: { type: String, required: true, maxlength: 65535 },
    thumbnail: { type: String, maxlength: 512, default: '' },
    icon: { type: String, maxlength: 100, default: '' },
    featured: { type: Number, default: 0, required: true },
    // Category relationships
    category_id: { type: Schema.Types.ObjectId, ref: 'ServiceCategories' },
    subcategory_id: { type: Schema.Types.ObjectId, ref: 'ServiceSubcategories' },
    // Pricing fields
    price: { type: mongoose.Schema.Types.Decimal128, default: null },
    price_type: { type: String, default: 'fixed', maxlength: 50 },
    price_label: { type: String, maxlength: 100, default: '' },
    price_description: { type: String, default: '' },
    currency: { type: String, default: 'NPR', maxlength: 10 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    statusId: { type: Schema.Types.ObjectId, ref: 'Status', required: true },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
}, {
    timestamps: true,
    collection: 'service_posts'
});

export const ServicePosts = models.ServicePosts || model('ServicePosts', servicePostsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const servicePosts = ServicePosts;
