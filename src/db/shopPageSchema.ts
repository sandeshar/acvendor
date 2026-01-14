import mongoose, { Schema, model, models } from 'mongoose';

// Shop Page Hero
const shopPageHeroSchema = new Schema({
    badge_text: { type: String, default: '', maxlength: 128 },
    tagline: { type: String, default: '', maxlength: 128 },
    title: { type: String, required: true, default: '', maxlength: 256 },
    highlight_text: { type: String, default: '', maxlength: 256 },
    subtitle: { type: String, default: '', maxlength: 512 },
    description: { type: String, default: '' },
    card_overlay_text: { type: String, default: '', maxlength: 512 },
    card_cta_text: { type: String, default: '', maxlength: 128 },
    card_cta_link: { type: String, default: '', maxlength: 512 },
    cta_text: { type: String, default: '', maxlength: 128 },
    cta_link: { type: String, default: '', maxlength: 512 },
    cta2_text: { type: String, default: '', maxlength: 128 },
    cta2_link: { type: String, default: '', maxlength: 512 },
    background_image: { type: String, default: '', maxlength: 512 },
    hero_image_alt: { type: String, default: '', maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_hero'
});

export const ShopPageHero = models.ShopPageHero || model('ShopPageHero', shopPageHeroSchema);

// Brand-specific Shop Hero (e.g., Midea)
const shopPageBrandHeroSchema = new Schema({
    brand_slug: { type: String, required: true, maxlength: 128 },
    badge_text: { type: String, default: '', maxlength: 128 },
    tagline: { type: String, default: '', maxlength: 128 },
    title: { type: String, required: true, default: '', maxlength: 256 },
    highlight_text: { type: String, default: '', maxlength: 256 },
    subtitle: { type: String, default: '', maxlength: 512 },
    description: { type: String, default: '' },
    card_overlay_text: { type: String, default: '', maxlength: 512 },
    card_cta_text: { type: String, default: '', maxlength: 128 },
    card_cta_link: { type: String, default: '', maxlength: 512 },
    cta_text: { type: String, default: '', maxlength: 128 },
    cta_link: { type: String, default: '', maxlength: 512 },
    cta2_text: { type: String, default: '', maxlength: 128 },
    cta2_link: { type: String, default: '', maxlength: 512 },
    background_image: { type: String, default: '', maxlength: 512 },
    hero_image_alt: { type: String, default: '', maxlength: 256 },
    display_order: { type: Number, default: 0, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_brand_hero'
});

export const ShopPageBrandHero = models.ShopPageBrandHero || model('ShopPageBrandHero', shopPageBrandHeroSchema);

// Shop Page CTA
const shopPageCTASchema = new Schema({
    title: { type: String, required: true, default: '', maxlength: 256 },
    description: { type: String, default: '', maxlength: 1024 },
    bullets: { type: String, default: '[]' }, // JSON string of bullets
    button_text: { type: String, default: '', maxlength: 100 },
    button_link: { type: String, default: '', maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_cta'
});

export const ShopPageCTA = models.ShopPageCTA || model('ShopPageCTA', shopPageCTASchema);

// Category/Brand Page CTA
const shopPageCategoryCTASchema = new Schema({
    category_slug: { type: String, required: true, maxlength: 128 },
    title: { type: String, required: true, default: '', maxlength: 256 },
    description: { type: String, default: '', maxlength: 1024 },
    bullets: { type: String, default: '[]' }, // Added bullets
    button1_text: { type: String, default: '', maxlength: 100 },
    button1_link: { type: String, default: '', maxlength: 512 },
    button2_text: { type: String, default: '', maxlength: 100 },
    button2_link: { type: String, default: '', maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'shop_page_category_cta'
});

export const ShopPageCategoryCTA = models.ShopPageCategoryCTA || model('ShopPageCategoryCTA', shopPageCategoryCTASchema);


// Backward compatibility exports (camelCase for existing API code)
export const shopPageHero = ShopPageHero;
export const shopPageBrandHero = ShopPageBrandHero;
export const shopPageCTA = ShopPageCTA;
export const shopPageCategoryCTA = ShopPageCategoryCTA;
