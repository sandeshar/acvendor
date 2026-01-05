import mongoose, { Schema, model, models } from 'mongoose';

// Contact Page Hero Section
const contactPageHeroSchema = new Schema({
    badge_text: { type: String, required: true, default: '', maxlength: 128 },
    tagline: { type: String, required: true, maxlength: 100 },
    title: { type: String, required: true, maxlength: 512 },
    description: { type: String, required: true, maxlength: 1024 },
    background_image: { type: String, required: true, default: '', maxlength: 512 },
    hero_image_alt: { type: String, required: true, default: '', maxlength: 256 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'contact_page_hero'
});

export const ContactPageHero = models.ContactPageHero || model('ContactPageHero', contactPageHeroSchema);

// Contact Page Info Section
const contactPageInfoSchema = new Schema({
    office_location: { type: String, required: true, maxlength: 256 },
    phone: { type: String, required: true, maxlength: 50 },
    email: { type: String, required: true, maxlength: 256 },
    map_url: { type: String, required: true, maxlength: 1024 },
    info_title: { type: String, required: true, default: 'Contact Information', maxlength: 128 },
    info_description: { type: String, required: true, default: "Reaching out for a repair, new installation, or general inquiry? We're just a call away.", maxlength: 512 },
    map_description: { type: String, required: true, default: 'Get directions to our main office for product demos and consultations.', maxlength: 256 },
    phone_item_1_subtext: { type: String, required: true, default: 'Sales Hotline (24/7)', maxlength: 128 },
    phone_item_2_subtext: { type: String, required: true, default: 'Service Support & Repairs', maxlength: 128 },
    whatsapp_title: { type: String, required: true, default: 'Chat on WhatsApp', maxlength: 128 },
    whatsapp_subtext: { type: String, required: true, default: 'Get instant quotes & support', maxlength: 128 },
    location_title: { type: String, required: true, default: 'Head Office', maxlength: 128 },
    opening_hours_title: { type: String, required: true, default: 'Opening Hours', maxlength: 128 },
    opening_hours_text: { type: String, required: true, default: "Sun - Fri: 9:00 AM - 6:00 PM\nSaturday: Closed", maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'contact_page_info'
});

export const ContactPageInfo = models.ContactPageInfo || model('ContactPageInfo', contactPageInfoSchema);

// Contact Page Form Configuration
const contactPageFormConfigSchema = new Schema({
    name_placeholder: { type: String, required: true, maxlength: 100 },
    email_placeholder: { type: String, required: true, maxlength: 100 },
    phone_placeholder: { type: String, maxlength: 100, default: '' },
    subject_placeholder: { type: String, required: true, maxlength: 100 },
    service_placeholder: { type: String, required: true, maxlength: 100 },
    message_placeholder: { type: String, required: true, maxlength: 100 },
    submit_button_text: { type: String, required: true, maxlength: 100 },
    success_message: { type: String, required: true, maxlength: 512 },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'contact_page_form_config'
});

export const ContactPageFormConfig = models.ContactPageFormConfig || model('ContactPageFormConfig', contactPageFormConfigSchema);

// Contact Form Submissions
const contactFormSubmissionsSchema = new Schema({
    name: { type: String, required: true, maxlength: 256 },
    email: { type: String, required: true, maxlength: 256 },
    phone: { type: String, maxlength: 50, default: '' },
    subject: { type: String, maxlength: 512, default: '' },
    service: { type: String, maxlength: 256, default: '' },
    message: { type: String, required: true, maxlength: 65535 },
    status: { type: String, default: 'new', required: true, maxlength: 50 },
}, {
    timestamps: true,
    collection: 'contact_form_submissions'
});

export const ContactFormSubmissions = models.ContactFormSubmissions || model('ContactFormSubmissions', contactFormSubmissionsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const contactPageHero = ContactPageHero;
export const contactPageInfo = ContactPageInfo;
export const contactPageFormConfig = ContactPageFormConfig;
export const contactFormSubmissions = ContactFormSubmissions;
