import { int, mysqlTable, timestamp, varchar, text } from 'drizzle-orm/mysql-core';

export const shopPageHero = mysqlTable('shop_page_hero', {
    id: int('id').primaryKey().autoincrement(),
    tagline: varchar('tagline', { length: 128 }).notNull().default(''),
    title: varchar('title', { length: 256 }).notNull().default(''),
    subtitle: varchar('subtitle', { length: 512 }).notNull().default(''),
    description: text('description').notNull().default(''),
    cta_text: varchar('cta_text', { length: 128 }).notNull().default(''),
    cta_link: varchar('cta_link', { length: 512 }).notNull().default(''),
    background_image: varchar('background_image', { length: 512 }).notNull().default(''),
    hero_image_alt: varchar('hero_image_alt', { length: 256 }).notNull().default(''),
    is_active: int('is_active').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Brand-specific Shop Hero (e.g., Midea)
export const shopPageBrandHero = mysqlTable('shop_page_brand_hero', {
    id: int('id').primaryKey().autoincrement(),
    brand_slug: varchar('brand_slug', { length: 128 }).notNull(),
    badge_text: varchar('badge_text', { length: 128 }).notNull().default(''),
    tagline: varchar('tagline', { length: 128 }).notNull().default(''),
    title: varchar('title', { length: 256 }).notNull().default(''),
    subtitle: varchar('subtitle', { length: 512 }).notNull().default(''),
    description: text('description').notNull().default(''),
    cta_text: varchar('cta_text', { length: 128 }).notNull().default(''),
    cta_link: varchar('cta_link', { length: 512 }).notNull().default(''),
    background_image: varchar('background_image', { length: 512 }).notNull().default(''),
    hero_image_alt: varchar('hero_image_alt', { length: 256 }).notNull().default(''),
    display_order: int('display_order').default(0).notNull(),
    is_active: int('is_active').default(1).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});