import mongoose, { Schema, model, models } from 'mongoose';

// Service Categories (Parent)
const serviceCategoriesSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    brand: { type: String, maxlength: 128, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, maxlength: 100, default: '' },
    thumbnail: { type: String, maxlength: 512, default: '' },
    display_order: { type: Number, default: 0, required: true },
    is_active: { type: Number, default: 1, required: true },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
}, { 
    timestamps: true,
    collection: 'service_categories'
});

export const ServiceCategories = models.ServiceCategories || model('ServiceCategories', serviceCategoriesSchema);

// Service Subcategories (Child of Categories)
const serviceSubcategoriesSchema = new Schema({
    category_id: { type: Schema.Types.ObjectId, ref: 'ServiceCategories', required: true },
    name: { type: String, required: true, maxlength: 256 },
    ac_type: { type: String, maxlength: 128, default: '' },
    slug: { type: String, required: true, unique: true, maxlength: 256 },
    description: { type: String, default: '' },
    icon: { type: String, maxlength: 100, default: '' },
    thumbnail: { type: String, maxlength: 512, default: '' },
    display_order: { type: Number, default: 0, required: true },
    is_active: { type: Number, default: 1, required: true },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
}, { 
    timestamps: true,
    collection: 'service_subcategories'
});

export const ServiceSubcategories = models.ServiceSubcategories || model('ServiceSubcategories', serviceSubcategoriesSchema);

// Backward compatibility exports (camelCase for existing API code)
export const serviceCategories = ServiceCategories;
export const serviceSubcategories = ServiceSubcategories;
