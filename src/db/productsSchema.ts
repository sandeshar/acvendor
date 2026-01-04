import mongoose, { Schema, model, models } from 'mongoose';

// Products Schema
const productSchema = new Schema({
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    title: { type: String, required: true, maxlength: 512 },
    excerpt: { type: String, required: true, default: '', maxlength: 1024 },
    content: { type: String, default: '' },
    thumbnail: { type: String, maxlength: 512, default: '' },
    price: { type: mongoose.Schema.Types.Decimal128, default: null },
    compare_at_price: { type: mongoose.Schema.Types.Decimal128, default: null },
    currency: { type: String, default: 'NRS', maxlength: 10 },
    statusId: { type: Number, default: 1, required: true },
    featured: { type: Number, default: 0, required: true },
    category_id: { type: Schema.Types.ObjectId, ref: 'ServiceCategories' },
    subcategory_id: { type: Schema.Types.ObjectId, ref: 'ServiceSubcategories' },
    model: { type: String, maxlength: 256, default: '' },
    capacity: { type: String, maxlength: 128, default: '' },
    warranty: { type: String, maxlength: 128, default: '' },
    energy_saving: { type: String, maxlength: 128, default: '' },
    smart: { type: Number, default: 0, required: true },
    filtration: { type: Number, default: 0, required: true },
    brochure_url: { type: String, maxlength: 512, default: '' },
    power: { type: String, maxlength: 128, default: '' },
    iseer: { type: String, maxlength: 64, default: '' },
    refrigerant: { type: String, maxlength: 64, default: '' },
    noise: { type: String, maxlength: 64, default: '' },
    dimensions: { type: String, maxlength: 128, default: '' },
    voltage: { type: String, maxlength: 64, default: '' },
    locations: { type: String, default: '' },
    inventory_status: { type: String, default: 'in_stock', maxlength: 64 },
    rating: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    reviews_count: { type: Number, default: 0, required: true },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
}, {
    timestamps: true,
    collection: 'products'
});

export const Product = models.Product || model('Product', productSchema);

// Product Images Schema
const productImageSchema = new Schema({
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    url: { type: String, required: true, maxlength: 512 },
    alt: { type: String, required: true, default: '', maxlength: 256 },
    is_primary: { type: Number, default: 0, required: true },
    display_order: { type: Number, default: 0, required: true },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'product_images'
});

export const ProductImage = models.ProductImage || model('ProductImage', productImageSchema);

// Backward compatibility exports (camelCase for existing API code)
export const products = Product;
export const productImages = ProductImage;
