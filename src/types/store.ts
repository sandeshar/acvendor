export interface StoreSettings {
    id: number;
    storeName: string;
    storeDescription: string;
    storeLogo: string;
    logoSize?: 'small' | 'medium' | 'large';
    favicon: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    footerText: string;
    footerSections?: {
        id?: number;
        title: string;
        order?: number;
        links?: { id?: number; label: string; href: string; isExternal?: boolean; order?: number }[];
    }[];
    // Theme identifier (e.g., 'default', 'ocean', 'corporate')
    theme: string;
    hideSiteName?: boolean;
    hideSiteNameOnMobile?: boolean;
    updatedAt: string;
}  
