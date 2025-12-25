export interface ContactHeroData {
    tagline: string;
    title: string;
    description: string;
}

// Homepage types
export interface HomepageHeroFloat {
    id?: number;
    icon: string;
    label: string;
    stat_text: string;
    position: string;
    display_order: number;
    is_active: number;
}

export interface HomepageHeroData {
    id?: number;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    background_image: string;
    hero_image_alt?: string;
    badge_text?: string;
    highlight_text?: string;
    colored_word?: string;
    secondary_cta_text?: string;
    secondary_cta_link?: string;
    rating_text?: string;
    is_active: number;
    updatedAt?: string | Date;
    floats?: HomepageHeroFloat[];
}

export interface ContactInfoData {
    office_location: string;
    phone: string;
    email: string;
    map_url: string;
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
    id: number;
    title: string;
    content: string;
    has_email: number;
}

// FAQ page types
export interface FAQHeaderData {
    title: string;
    description: string;
    search_placeholder: string;
}

export interface FAQCategory {
    id: number;
    name: string;
}

export interface FAQItem {
    id: number;
    category_id: number;
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
export type ServiceRecord = {
    id?: number;
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
