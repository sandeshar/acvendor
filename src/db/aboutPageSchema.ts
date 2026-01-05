import mongoose, { Schema, model, models } from 'mongoose';

// About Page Hero Section
const aboutPageHeroSchema = new Schema({
    title: { type: String, required: true, maxlength: 512 },
    description: { type: String, required: true, maxlength: 1024 },
    button1_text: { type: String, required: true, maxlength: 100 },
    button1_link: { type: String, required: true, maxlength: 512 },
    button2_text: { type: String, required: true, maxlength: 100 },
    button2_link: { type: String, required: true, maxlength: 512 },
    hero_image: { type: String, required: true, maxlength: 512 },
    hero_image_alt: { type: String, required: true, maxlength: 256 },
    badge_text: { type: String, required: true, default: '', maxlength: 128 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_hero'
});

export const AboutPageHero = models.AboutPageHero || model('AboutPageHero', aboutPageHeroSchema);

// About Page Journey Section
const aboutPageJourneySchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    paragraph1: { type: String, required: true, maxlength: 1024 },
    paragraph2: { type: String, required: true, maxlength: 1024 },
    thinking_box_title: { type: String, required: true, maxlength: 256 },
    thinking_box_content: { type: String, required: true, maxlength: 1024 },
    highlights: { type: String, required: true, default: '[]', maxlength: 1024 },
    hero_image: { type: String, required: true, default: '', maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_journey'
});

export const AboutPageJourney = models.AboutPageJourney || model('AboutPageJourney', aboutPageJourneySchema);

// About Page Stats
const aboutPageStatsSchema = new Schema({
    label: { type: String, required: true, maxlength: 100 },
    value: { type: String, required: true, maxlength: 50 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_stats'
});

export const AboutPageStats = models.AboutPageStats || model('AboutPageStats', aboutPageStatsSchema);

// About Page Features
const aboutPageFeaturesSchema = new Schema({
    icon: { type: String, required: true, default: '', maxlength: 128 },
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_features'
});

export const AboutPageFeatures = models.AboutPageFeatures || model('AboutPageFeatures', aboutPageFeaturesSchema);

// About Page Certifications
const aboutPageCertificationsSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    logo: { type: String, required: true, default: '', maxlength: 512 },
    link: { type: String, required: true, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_certifications'
});

export const AboutPageCertifications = models.AboutPageCertifications || model('AboutPageCertifications', aboutPageCertificationsSchema);

// Certifications Section metadata
const aboutPageCertificationsSectionSchema = new Schema({
    title: { type: String, required: true, default: '', maxlength: 256 },
    subtitle: { type: String, required: true, default: '', maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_certifications_section'
});

export const AboutPageCertificationsSection = models.AboutPageCertificationsSection || model('AboutPageCertificationsSection', aboutPageCertificationsSectionSchema);

// About Page Badges
const aboutPageBadgesSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    logo: { type: String, required: true, default: '', maxlength: 512 },
    link: { type: String, required: true, default: '', maxlength: 512 },
    display_order: { type: Number, required: true, default: 0 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_badges'
});

export const AboutPageBadges = models.AboutPageBadges || model('AboutPageBadges', aboutPageBadgesSchema);

// About Page Philosophy Section
const aboutPagePhilosophySchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_philosophy'
});

export const AboutPagePhilosophy = models.AboutPagePhilosophy || model('AboutPagePhilosophy', aboutPagePhilosophySchema);

// About Page Principles
const aboutPagePrinciplesSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_principles'
});

export const AboutPagePrinciples = models.AboutPagePrinciples || model('AboutPagePrinciples', aboutPagePrinciplesSchema);

// About Page Team Section
const aboutPageTeamSectionSchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_team_section'
});

export const AboutPageTeamSection = models.AboutPageTeamSection || model('AboutPageTeamSection', aboutPageTeamSectionSchema);

// About Page Team Members
const aboutPageTeamMembersSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    role: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 1024 },
    image: { type: String, required: true, maxlength: 512 },
    image_alt: { type: String, required: true, maxlength: 256 },
    display_order: { type: Number, required: true },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: true,
    collection: 'about_page_team_members'
});

export const AboutPageTeamMembers = models.AboutPageTeamMembers || model('AboutPageTeamMembers', aboutPageTeamMembersSchema);

// About Page CTA Section
const aboutPageCTASchema = new Schema({
    title: { type: String, required: true, maxlength: 256 },
    description: { type: String, required: true, maxlength: 512 },
    primary_button_text: { type: String, required: true, maxlength: 100 },
    primary_button_link: { type: String, required: true, maxlength: 512 },
    secondary_button_text: { type: String, required: true, maxlength: 100 },
    secondary_button_link: { type: String, required: true, maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'about_page_cta'
});

export const AboutPageCTA = models.AboutPageCTA || model('AboutPageCTA', aboutPageCTASchema);

// Backward compatibility exports (camelCase for existing API code)
export const aboutPageHero = AboutPageHero;
export const aboutPageJourney = AboutPageJourney;
export const aboutPageStats = AboutPageStats;
export const aboutPageFeatures = AboutPageFeatures;
export const aboutPageCertifications = AboutPageCertifications;
export const aboutPageCertificationsSection = AboutPageCertificationsSection;
export const aboutPageBadges = AboutPageBadges;
export const aboutPagePhilosophy = AboutPagePhilosophy;
export const aboutPagePrinciples = AboutPagePrinciples;
export const aboutPageTeamSection = AboutPageTeamSection;
export const aboutPageTeamMembers = AboutPageTeamMembers;
export const aboutPageCTA = AboutPageCTA;
