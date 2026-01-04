import mongoose, { Schema, model, models } from 'mongoose';

// Shop Page Hero
const shopPageHeroSchema = new Schema({
    tagline: { type: String, required: true, default: '', maxlength: 128 },
    title: { type: String, required: true, default: '', maxlength: 256 },
    subtitle: { type: String, required: true, default: '', maxlength: 512 },
    description: { type: String, required: true, default: '' },
    cta_text: { type: String, required: true, default: '', maxlength: 128 },
    cta_link: { type: String, required: true, default: '', maxlength: 512 },
    background_image: { type: String, required: true, default: '', maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_hero'
});

export const ShopPageHero = models.ShopPageHero || model('ShopPageHero', shopPageHeroSchema);

// Brand-specific Shop Hero (e.g., Midea)
const shopPageBrandHeroSchema = new Schema({
    brand_slug: { type: String, required: true, maxlength: 128 },
    badge_text: { type: String, required: true, default: '', maxlength: 128 },
    tagline: { type: String, required: true, default: '', maxlength: 128 },
    title: { type: String, required: true, default: '', maxlength: 256 },
    subtitle: { type: String, required: true, default: '', maxlength: 512 },
    description: { type: String, required: true, default: '' },
    cta_text: { type: String, required: true, default: '', maxlength: 128 },
    cta_link: { type: String, required: true, default: '', maxlength: 512 },
    background_image: { type: String, required: true, default: '', maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    display_order: { type: Number, default: 0, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_brand_hero'
});

export const ShopPageBrandHero = models.ShopPageBrandHero || model('ShopPageBrandHero', shopPageBrandHeroSchema);

// Backward compatibility exports (camelCase for existing API code)
export const shopPageHero = ShopPageHero;
export const shopPageBrandHero = ShopPageBrandHero;
