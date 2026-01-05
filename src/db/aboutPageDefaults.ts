// Centralized default content for About page components

export interface FeatureDefault {
    id?: number;
    title: string;
    description: string;
    icon?: string;
}

export const DEFAULT_FEATURES: FeatureDefault[] = [
    {
        title: '24/7 Support',
        description: 'AC breakdown in the middle of summer? Our emergency repair team is on standby round-the-clock in major cities.',
        icon: 'support_agent',
    },
    {
        title: 'Genuine Parts',
        description: 'We guarantee 100% authentic spare parts directly from manufacturers to ensure the longevity of your system.',
        icon: 'verified_user',
    },
    {
        title: 'Energy Efficient',
        description: 'Our modern inverter solutions are designed to lower your electricity bills while maximizing cooling output.',
        icon: 'bolt',
    },
];

export const DEFAULT_HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDda5biMwpMvtX_h7btShwaroEUJ1ijOwryycUDayNUEpgCs5Get0Ep6MoDB5u_3rw9c-R5gRyZWYnGqHuoiqBOTd3JUyVZuq0UUXI8R2BUjuY5HIq_-4V_ckfdOBetgRgNaf-rpTdE7AtC-rxH-KYR9y4D8oTpDqs_FSBTaaWChdJ0ilJKnKdEc2PzxxHoZixugfmxmKMdJ_Stnxg81KaJVzEjzoOwjuv-RFS4_nBIQkPZForGEXJHgs8q0H05VzwwvwgkkURRlMg';
export const DEFAULT_HERO_IMAGE_ALT = 'Team of professionals';

export const DEFAULT_HIGHLIGHTS: string[] = ['ISO 9001:2015 Certified', 'Authorized Distributor'];

export interface StatDefault {
    id: number;
    label: string;
    value: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

export const DEFAULT_STATS: StatDefault[] = [
    { id: -1, label: 'Installations', value: '5000+', display_order: 1, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -2, label: 'Years Experience', value: '15+', display_order: 2, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -3, label: 'Certified Techs', value: '50+', display_order: 3, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: -4, label: 'Client Satisfaction', value: '100%', display_order: 4, is_active: 1, createdAt: new Date(), updatedAt: new Date() },
];

export const DEFAULT_JOURNEY_TITLE = 'Bringing Comfort to Every Nepali Home & Business';
export const DEFAULT_THINKING_BOX_TITLE = 'Why Choose AC Vendor?';
export const DEFAULT_THINKING_BOX_CONTENT = 'We combine international quality standards with deep local knowledge to deliver superior cooling solutions.';

export interface CertificationDefault {
    id?: number;
    name: string;
    logo?: string;
    link?: string;
}

export const DEFAULT_CERTIFICATIONS: CertificationDefault[] = [
    { name: 'Hotel Himalaya', logo: '', link: '/' },
    { name: 'Nepal Bank', logo: '', link: '/' },
    { name: 'City Hospital', logo: '', link: '/' },
    { name: 'Kathmandu Uni', logo: '', link: '/' },
];

export const DEFAULT_CERTIFICATIONS_SECTION = {
    title: 'Trusted by Industry Leaders',
    subtitle: 'Authorized Sales & Service Partners for Major Global Brands',
};
