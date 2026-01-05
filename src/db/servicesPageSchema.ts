import mongoose, { Schema, model, models } from 'mongoose';

// Services Page Hero Section
const servicesPageHeroSchema = new Schema({
    tagline: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    badge_text: { type: String, required: true, default: '', maxlength: 128 },
    highlight_text: { type: String, required: true, default: '', maxlength: 256 },
    primary_cta_text: { type: String, required: true, default: '', maxlength: 128 },
    primary_cta_link: { type: String, required: true, default: '', maxlength: 512 },
    secondary_cta_text: { type: String, required: true, default: '', maxlength: 128 },
    secondary_cta_link: { type: String, required: true, default: '', maxlength: 512 },
    background_image: { type: String, required: true, default: '', maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'services_page_hero'
});

export const ServicesPageHero = models.ServicesPageHero || model('ServicesPageHero', servicesPageHeroSchema);

// Services Page Details
const servicesPageDetailsSchema = new Schema({
    key: { type: String, required: true, unique: true, maxlength: 50 },
    slug: { type: String, maxlength: 256, default: '' },
    icon: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    bullets: { type: String, required: true, default: '[]' }, // JSON array
    image: { type: String, required: true, maxlength: 512 },
    image_alt: { type: String, required: true, maxlength: 256 },
    postId: { type: String, default: null },
    locations: { type: String, default: '[]' }, // JSON array
    inventory_status: { type: String, default: 'in_stock', maxlength: 64 },
    images: { type: String, default: '[]' }, // JSON array
    price: { type: String, maxlength: 64, default: '' },
    compare_at_price: { type: String, maxlength: 64, default: '' },
    currency: { type: String, default: 'NRS', maxlength: 10 },
    model: { type: String, maxlength: 256, default: '' },
    capacity: { type: String, maxlength: 128, default: '' },
    warranty: { type: String, maxlength: 128, default: '' },
    technical: { type: String, default: '' },
    energy_saving: { type: String, maxlength: 128, default: '' },
    smart: { type: Number, default: 0, required: true },
    filtration: { type: Number, default: 0, required: true },
    brochure_url: { type: String, maxlength: 512, default: '' },
    application_areas: { type: String, default: '' },
    features: { type: String, default: '' },
    meta_title: { type: String, maxlength: 256, default: '' },
    meta_description: { type: String, maxlength: 512, default: '' },
    content: { type: String, default: '' },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'services_page_details'
});

export const ServicesPageDetails = models.ServicesPageDetails || model('ServicesPageDetails', servicesPageDetailsSchema);

// Services Page Process Section
const servicesPageProcessSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'services_page_process_section'
});

export const ServicesPageProcessSection = models.ServicesPageProcessSection || model('ServicesPageProcessSection', servicesPageProcessSectionSchema);

// Services Page Process Steps
const servicesPageProcessStepsSchema = new Schema({
    step_number: { type: Number, required: true },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'services_page_process_steps'
});

export const ServicesPageProcessSteps = models.ServicesPageProcessSteps || model('ServicesPageProcessSteps', servicesPageProcessStepsSchema);

// Services Page CTA
const servicesPageCTASchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    button_text: { type: String, required: true, maxlength: 100 },
    button_link: { type: String, required: true, maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'services_page_cta'
});

export const ServicesPageCTA = models.ServicesPageCTA || model('ServicesPageCTA', servicesPageCTASchema);

// Services Page Brands
const servicesPageBrandsSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    slug: { type: String, maxlength: 128, default: '' },
    logo: { type: String, required: true, default: '', maxlength: 512 },
    link: { type: String, required: true, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'services_page_brands'
});

export const ServicesPageBrands = models.ServicesPageBrands || model('ServicesPageBrands', servicesPageBrandsSchema);

// Services Page Trust
const servicesPageTrustSchema = new Schema({
    title: { type: String, required: true, default: '', maxlength: 256 },
    description: { type: String, required: true, default: '', maxlength: 1024 },
    quote_text: { type: String, required: true, default: '', maxlength: 1024 },
    quote_author: { type: String, required: true, default: '', maxlength: 256 },
    quote_role: { type: String, required: true, default: '', maxlength: 256 },
    quote_image: { type: String, required: true, default: '', maxlength: 512 },
    stat1_value: { type: String, default: '' },
    stat1_label: { type: String, default: '' },
    stat1_sublabel: { type: String, default: '' },
    stat2_value: { type: String, default: '' },
    stat2_label: { type: String, default: '' },
    stat2_sublabel: { type: String, default: '' },
    stat3_value: { type: String, default: '' },
    stat3_label: { type: String, default: '' },
    stat3_sublabel: { type: String, default: '' },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'services_page_trust'
});

export const ServicesPageTrust = models.ServicesPageTrust || model('ServicesPageTrust', servicesPageTrustSchema);

// Services Page Features
const servicesPageFeaturesSchema = new Schema({
    icon: { type: String, required: true, default: '', maxlength: 128 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'services_page_features'
});

export const ServicesPageFeatures = models.ServicesPageFeatures || model('ServicesPageFeatures', servicesPageFeaturesSchema);

// Backward compatibility exports (camelCase for existing API code)
export const servicesPageHero = ServicesPageHero;
export const servicesPageDetails = ServicesPageDetails;
export const servicesPageProcessSection = ServicesPageProcessSection;
export const servicesPageProcessSteps = ServicesPageProcessSteps;
export const servicesPageCTA = ServicesPageCTA;
export const servicesPageBrands = ServicesPageBrands;
export const servicesPageTrust = ServicesPageTrust;
export const servicesPageFeatures = ServicesPageFeatures;
