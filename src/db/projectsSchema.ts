import { mysqlTable, serial, varchar, text, int, timestamp, boolean } from 'drizzle-orm/mysql-core';

export const projectsSection = mysqlTable('projects_section', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull().default('Our Engineering Excellence'),
    description: text('description').notNull(),
    background_image: text('background_image').notNull(),
    badge_text: varchar('badge_text', { length: 100 }).default('Portfolio'),

    // CTA Section
    cta_title: varchar('cta_title', { length: 255 }).default('Ready to upgrade your climate control?'),
    cta_description: text('cta_description'),
    cta_button_text: varchar('cta_button_text', { length: 100 }).default('Contact Our Engineers'),
    cta_button_link: varchar('cta_button_link', { length: 255 }).default('/contact'),
    secondary_cta_text: varchar('secondary_cta_text', { length: 100 }).default('Download Portfolio'),
    secondary_cta_link: varchar('secondary_cta_link', { length: 255 }).default('#'),

    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const projects = mysqlTable('projects', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(), // Residential, Commercial, etc.
    location: varchar('location', { length: 255 }).notNull(),
    capacity: varchar('capacity', { length: 255 }).notNull(),
    system: varchar('system', { length: 255 }).notNull(),
    image: text('image').notNull(),
    image_alt: varchar('image_alt', { length: 255 }),
    display_order: int('display_order').default(0),
    is_active: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
