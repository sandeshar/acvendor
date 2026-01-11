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
    // About block (heading + rich text paragraph)
    about_heading: { type: String, required: false, default: '', maxlength: 256 },
    about_paragraph: { type: String, required: false, default: '', maxlength: 10000 },
    name_placeholder: { type: String, required: true, maxlength: 100 },
    email_placeholder: { type: String, required: true, maxlength: 100 },
    phone_placeholder: { type: String, maxlength: 100, default: '' },
    service_placeholder: { type: String, required: true, maxlength: 100 },
    message_placeholder: { type: String, required: true, maxlength: 100 },
    submit_button_text: { type: String, required: true, maxlength: 100 },
    cta_text: { type: String, required: false, default: '', maxlength: 100 },
    cta_link: { type: String, required: false, default: '/contact', maxlength: 512 },
    cta_style: { type: String, required: false, default: 'arrow', maxlength: 50 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_contact_section'
});

export const HomepageContactSection = models.HomepageContactSection || model('HomepageContactSection', homepageContactSectionSchema);

// Homepage Products Section
const homepageProductsSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_products_section'
});

export const HomepageProductsSection = models.HomepageProductsSection || model('HomepageProductsSection', homepageProductsSectionSchema);

// Homepage About Section
const homepageAboutSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 2048 },
    bullets: { type: String, required: false, default: '[]', maxlength: 4096 },
    image_url: { type: String, required: false, default: '', maxlength: 512 },
    image_alt: { type: String, required: false, default: '', maxlength: 256 },
    cta_text: { type: String, default: '', maxlength: 100 },
    cta_link: { type: String, default: '', maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_about_section'
});

export const HomepageAboutSection = models.HomepageAboutSection || model('HomepageAboutSection', homepageAboutSectionSchema);

// Homepage Blog Section
const homepageBlogSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    subtitle: { type: String, required: true, maxlength: 1024 },
    cta_text: { type: String, default: '', maxlength: 100 },
    cta_link: { type: String, default: '', maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_blog_section'
});

export const HomepageBlogSection = models.HomepageBlogSection || model('HomepageBlogSection', homepageBlogSectionSchema);

// Homepage Testimonials Section
const homepageTestimonialsSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    subtitle: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'homepage_testimonials_section'
});

export const HomepageTestimonialsSection = models.HomepageTestimonialsSection || model('HomepageTestimonialsSection', homepageTestimonialsSectionSchema);

// Homepage Hero Features (Floating Cards)
const homepageHeroFeaturesSchema = new Schema({
    icon_name: { type: String, required: true, maxlength: 128 },
    icon_bg: { type: String, default: 'bg-blue-600', maxlength: 128 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'homepage_hero_features'
});

export const HomepageHeroFeatures = models.HomepageHeroFeaturesV2 || model('HomepageHeroFeaturesV2', homepageHeroFeaturesSchema);

// Homepage About Items (multiple entries like services)
const homepageAboutItemsSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 2048 },
    bullets: { type: String, required: false, default: '[]', maxlength: 4096 },
    image_url: { type: String, required: false, default: '', maxlength: 512 },
    image_alt: { type: String, required: false, default: '', maxlength: 256 },
    cta_text: { type: String, default: '', maxlength: 100 },
    cta_link: { type: String, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'homepage_about_items'
});

export const HomepageAboutItems = models.HomepageAboutItemsV2 || model('HomepageAboutItemsV2', homepageAboutItemsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const homepageHero = HomepageHero;
export const homepageTrustLogos = HomepageTrustLogos;
export const homepageTrustSection = HomepageTrustSection;
export const homepageExpertiseSection = HomepageExpertiseSection;
export const homepageExpertiseItems = HomepageExpertiseItems;
export const homepageContactSection = HomepageContactSection;
export const homepageProductsSection = HomepageProductsSection;
export const homepageTestimonialsSection = HomepageTestimonialsSection;
export const homepageHeroFeatures = HomepageHeroFeatures;
export const homepageBlogSection = HomepageBlogSection;
export const homepageAboutSection = HomepageAboutSection;
export const homepageAboutItems = HomepageAboutItems;
