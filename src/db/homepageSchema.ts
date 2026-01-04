import mongoose, { Schema, model, models } from 'mongoose';

// Homepage Hero Section
const homepageHeroSchema = new Schema({
    title: { type: String, required: true, maxlength: 512 },
    subtitle: { type: String, required: true, maxlength: 1024 },
    cta_text: { type: String, required: true, maxlength: 100 },
    cta_link: { type: String, required: true, maxlength: 512 },
    background_image: { type: String, required: true, maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    badge_text: { type: String, required: true, default: '', maxlength: 128 },
    highlight_text: { type: String, required: true, default: '', maxlength: 256 },
    colored_word: { type: String, required: true, default: '', maxlength: 256 },
    // Floating UI element - top card
    float_top_enabled: { type: Number, default: 1, required: true },
    float_top_icon: { type: String, required: true, default: 'trending_up', maxlength: 100 },
    float_top_title: { type: String, required: true, default: 'Growth', maxlength: 128 },
    float_top_value: { type: String, required: true, default: '+240% ROI', maxlength: 64 },
    // Floating UI element - bottom card
    float_bottom_enabled: { type: Number, default: 1, required: true },
    float_bottom_icon: { type: String, required: true, default: 'check_circle', maxlength: 100 },
    float_bottom_title: { type: String, required: true, default: 'Ranking', maxlength: 128 },
    float_bottom_value: { type: String, required: true, default: '#1 Result', maxlength: 64 },
    secondary_cta_text: { type: String, required: true, default: '', maxlength: 128 },
    secondary_cta_link: { type: String, required: true, default: '', maxlength: 512 },
    rating_text: { type: String, required: true, default: '', maxlength: 128 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_hero'
});

export const HomepageHero = models.HomepageHero || model('HomepageHero', homepageHeroSchema);

// Homepage Trust Section (Company Logos)
const homepageTrustLogosSchema = new Schema({
    alt_text: { type: String, required: true, maxlength: 256 },
    logo_url: { type: String, required: true, maxlength: 512 },
    invert: { type: Number, default: 0, required: true },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'homepage_trust_logos'
});

export const HomepageTrustLogos = models.HomepageTrustLogos || model('HomepageTrustLogos', homepageTrustLogosSchema);

// Homepage Trust Section
const homepageTrustSectionSchema = new Schema({
    heading: { type: String, required: true, maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_trust_section'
});

export const HomepageTrustSection = models.HomepageTrustSection || model('HomepageTrustSection', homepageTrustSectionSchema);

// Homepage Expertise Section
const homepageExpertiseSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_expertise_section'
});

export const HomepageExpertiseSection = models.HomepageExpertiseSection || model('HomepageExpertiseSection', homepageExpertiseSectionSchema);

// Homepage Expertise Items
const homepageExpertiseItemsSchema = new Schema({
    icon: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'homepage_expertise_items'
});

export const HomepageExpertiseItems = models.HomepageExpertiseItems || model('HomepageExpertiseItems', homepageExpertiseItemsSchema);

// Homepage Contact Section
const homepageContactSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    name_placeholder: { type: String, required: true, maxlength: 100 },
    email_placeholder: { type: String, required: true, maxlength: 100 },
    phone_placeholder: { type: String, maxlength: 100, default: '' },
    service_placeholder: { type: String, required: true, maxlength: 100 },
    message_placeholder: { type: String, required: true, maxlength: 100 },
    submit_button_text: { type: String, required: true, maxlength: 100 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_contact_section'
});

export const HomepageContactSection = models.HomepageContactSection || model('HomepageContactSection', homepageContactSectionSchema);

// Backward compatibility exports (camelCase for existing API code)
export const homepageHero = HomepageHero;
export const homepageTrustLogos = HomepageTrustLogos;
export const homepageTrustSection = HomepageTrustSection;
export const homepageExpertiseSection = HomepageExpertiseSection;
export const homepageExpertiseItems = HomepageExpertiseItems;
export const homepageContactSection = HomepageContactSection;
