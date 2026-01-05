// TypeScript types for Service Categories and Subcategories

export interface ServiceCategory {
    id?: string | number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    thumbnail?: string | null;
    display_order: number;
    is_active: number;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ServiceSubcategory {
    id?: string | number;
    category_id: string | number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    thumbnail?: string | null;
    display_order: number;
    is_active: number;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ServicePostWithPricing {
    id?: string | number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    thumbnail?: string | null;
    icon?: string | null;
    featured: number;
    category_id?: string | number | null;
    subcategory_id?: string | number | null;
    price?: string | null; // Decimal stored as string
    price_type?: string; // 'fixed', 'hourly', 'monthly', 'custom'
    price_label?: string | null; // 'Starting at', 'From', 'Per hour'
    price_description?: string | null;
    currency?: string | null; // Currency code like USD, EUR, GBP
    authorId: string | number;
    statusId: string | number;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// Type for category with subcategories
export interface CategoryWithSubcategories extends ServiceCategory {
    subcategories?: ServiceSubcategory[];
}

// Type for service with category and subcategory details
export interface ServiceWithCategories extends ServicePostWithPricing {
    category?: ServiceCategory | null;
    subcategory?: ServiceSubcategory | null;
}
