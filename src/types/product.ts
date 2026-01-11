export interface ProductCategory {
    id?: number;
    name: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    display_order: number;
    is_active: number;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductSubcategory {
    id?: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    display_order: number;
    is_active: number;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductImage {
    id?: number;
    product_id: number;
    url: string;
    alt?: string | null;
    is_primary?: number;
    display_order?: number;
    createdAt?: Date;
}

export interface ProductPost {
    id?: number;
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string | null;
    price?: string | null;
    compare_at_price?: string | null;
    discount_percent?: number | null;
    discounted_price?: string | null;
    currency?: string | null;
    statusId?: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    model?: string | null;
    capacity?: string | null;
    warranty?: string | null;
    energy_saving?: string | null;
    smart?: number | boolean | null;
    filtration?: number | boolean | null;
    brochure_url?: string | null;
    power?: string | null;
    iseer?: string | null;
    refrigerant?: string | null;
    noise?: string | null;
    dimensions?: string | null;
    voltage?: string | null;
    locations?: string[] | string | null;
    inventory_status?: string | null;
    technical_enabled?: number | null;
    rating?: number | null;
    reviews_count?: number | null;
    meta_title?: string | null;
    meta_description?: string | null;
    technical?: Record<string, any> | null;
    application_areas?: Array<{ icon?: string; label: string }> | string[] | string | null;
    features?: Array<{ icon?: string; label: string }> | string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductWithRelations extends ProductPost {
    category?: ProductCategory | null;
    subcategory?: ProductSubcategory | null;
    images?: ProductImage[];
    reviews?: Array<any>;
    reviews_breakdown?: Record<number, number>;
}
