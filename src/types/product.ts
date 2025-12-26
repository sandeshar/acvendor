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
    currency?: string | null;
    statusId?: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    model?: string | null;
    capacity?: string | null;
    warranty?: string | null;
    inventory_status?: string | null;
    rating?: number | null;
    reviews_count?: number | null;
    meta_title?: string | null;
    meta_description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductWithRelations extends ProductPost {
    category?: ProductCategory | null;
    subcategory?: ProductSubcategory | null;
    images?: ProductImage[];
}
