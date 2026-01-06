export interface ContactHeroData {
    id?: string;
    title: string;
    description: string;
    badge_text?: string;
    background_image?: string;
    is_active?: number;
}

// Homepage types
export interface HomepageHeroData {
    id?: string;
    title: string;
    description: string;
    badge_text?: string;
    highlight_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image: string;
    hero_image_alt?: string;
    colored_word?: string;
    is_active: number;
    updatedAt?: string | Date;
}

// About page types
export interface AboutHeroData {
    id?: string;
    title: string;
    description: string;
    badge_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image: string;
    hero_image_alt?: string;
    is_active: number;
}

// Shop page types
export interface ShopHeroData {
    id?: string;
    title: string;
    description: string;
    badge_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image: string;
    hero_image_alt?: string;
    /** Short text shown inside the image card overlay on the /shop hero */
    card_overlay_text?: string;
    /** Optional CTA specific to the image card overlay */
    card_cta_text?: string;
    card_cta_link?: string;
    brand?: string;
    is_active: number;
}

export interface ContactInfoData {
    office_location: string;
    phone: string;
    email: string;
    map_url: string;

    // Optional editable copy
    info_title?: string;
    info_description?: string;
    phone_item_1_subtext?: string;
    phone_item_2_subtext?: string;
    whatsapp_title?: string;
    whatsapp_subtext?: string;
    location_title?: string;
    opening_hours_title?: string;
    opening_hours_text?: string;
    map_description?: string;
}

export interface ContactFormConfigData {
    name_placeholder: string;
    email_placeholder: string;
    phone_placeholder?: string;
    subject_placeholder: string;
    service_placeholder?: string;
    message_placeholder: string;
    submit_button_text: string;
    success_message: string;
}

// Terms page types
export interface TermsHeaderData {
    title: string;
    last_updated: string;
}

export interface TermsSectionData {
    id: string;
    title: string;
    content: string;
    has_email: number;
}

// FAQ page types
export interface FAQHeaderData {
    id?: string;
    title: string;
    description: string;
    badge_text?: string;
    highlight_text?: string;
    background_image?: string;
    is_active?: number;
}

export interface FAQCategory {
    id: string;
    name: string;
}

export interface FAQItem {
    id: string;
    category_id: string;
    question: string;
    answer: string;
}

export interface FAQCTAData {
    title: string;
    description: string;
    button_text: string;
    button_link: string;
}

// Service page types
export interface ServicesHeroData {
    id?: string;
    tagline?: string;
    title: string;
    description: string;
    badge_text?: string;
    highlight_text?: string;
    primary_cta_text?: string;
    primary_cta_link?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    background_image: string;
    hero_image_alt?: string;
    is_active: number;
}

export interface ServicesTrustData {
    id?: string;
    title: string;
    description: string;
    stat1_value?: string;
    stat1_label?: string;
    stat1_sublabel?: string;
    stat2_value?: string;
    stat2_label?: string;
    stat2_sublabel?: string;
    stat3_value?: string;
    stat3_label?: string;
    stat3_sublabel?: string;
    testimonial_text?: string;
    testimonial_author?: string;
    testimonial_role?: string;
    testimonial_image?: string;
    is_active: number;
}

export type ServiceRecord = {
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    thumbnail?: string | null;
    images?: string[] | null;
    icon?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    price?: string | number | null;
    currency?: string | null;
    price_type?: string | null;
    price_label?: string | null;
    price_description?: string | null;

    // Additional product/service-specific fields
    category?: string | null;
    subcategory?: string | null;
    inventory_status?: string | null;
    rating?: number | null;
    reviews_count?: number | null;
    model?: string | null;
    subtitle?: string | null;
    locations?: string[] | null;
    compare_at_price?: number | string | null;
    energy_saving?: string | null;
    smart?: boolean | null;
    filtration?: boolean | null;
    warranty?: string | null;
    brochure_url?: string | null;
    summary?: string | null;
    capacity?: string | null;
    power?: string | null;
    iseer?: string | number | null;
    refrigerant?: string | null;
    noise?: string | null;
    dimensions?: string | null;
    voltage?: string | null;
};

export type ServiceDetail = {
    title: string;
    bullets: string;
};

export type ServicePostPageProps = {
    params: Promise<{ slug: string }>;
};

// Blog post page types
export interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}
