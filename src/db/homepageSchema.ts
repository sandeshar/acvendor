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
    colored_word: { type: String, required: true, default: '', maxlength: 256 },
    // Trust Badges
    trust_badge1_text: { type: String, required: true, default: 'Certified Techs', maxlength: 128 },
    trust_badge1_icon: { type: String, required: true, default: 'engineering', maxlength: 100 },
    trust_badge2_text: { type: String, required: true, default: '1 Year Warranty', maxlength: 128 },
    trust_badge2_icon: { type: String, required: true, default: 'verified_user', maxlength: 100 },
    trust_badge3_text: { type: String, required: true, default: 'Same Day Service', maxlength: 128 },
    trust_badge3_icon: { type: String, required: true, default: 'schedule', maxlength: 100 },
    secondary_cta_text: { type: String, required: true, default: '', maxlength: 128 },
    secondary_cta_link: { type: String, required: true, default: '', maxlength: 512 },
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
