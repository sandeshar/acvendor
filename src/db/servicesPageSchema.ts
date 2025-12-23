import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// Services Page Hero Section
export const servicesPageHero = mysqlTable("services_page_hero", {
    id: int("id").primaryKey().autoincrement(),
    tagline: varchar("tagline", { length: 100 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    badge_text: varchar("badge_text", { length: 128 }).notNull().default(''),
    highlight_text: varchar("highlight_text", { length: 256 }).notNull().default(''),
    primary_cta_text: varchar("primary_cta_text", { length: 128 }).notNull().default(''),
    primary_cta_link: varchar("primary_cta_link", { length: 512 }).notNull().default(''),
    secondary_cta_text: varchar("secondary_cta_text", { length: 128 }).notNull().default(''),
    secondary_cta_link: varchar("secondary_cta_link", { length: 512 }).notNull().default(''),
    background_image: varchar("background_image", { length: 512 }).notNull().default(''),
    hero_image_alt: varchar("hero_image_alt", { length: 256 }).notNull().default(''),
    stat1_value: varchar("stat1_value", { length: 64 }).notNull().default(''),
    stat1_label: varchar("stat1_label", { length: 128 }).notNull().default(''),
    stat2_value: varchar("stat2_value", { length: 64 }).notNull().default(''),
    stat2_label: varchar("stat2_label", { length: 128 }).notNull().default(''),
    stat3_value: varchar("stat3_value", { length: 64 }).notNull().default(''),
    stat3_label: varchar("stat3_label", { length: 128 }).notNull().default(''),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Services Page - Services Section (grid) removed as unused

// Services Page - Service Details
export const servicesPageDetails = mysqlTable("services_page_details", {
    id: int("id").primaryKey().autoincrement(),
    key: varchar("key", { length: 50 }).notNull().unique(),
    slug: varchar("slug", { length: 256 }),
    icon: varchar("icon", { length: 100 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    bullets: varchar("bullets", { length: 1024 }).notNull(), // JSON array stored as string
    image: varchar("image", { length: 512 }).notNull(),
    image_alt: varchar("image_alt", { length: 256 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Services Page - Process Section
export const servicesPageProcessSection = mysqlTable("services_page_process_section", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const servicesPageProcessSteps = mysqlTable("services_page_process_steps", {
    id: int("id").primaryKey().autoincrement(),
    step_number: int("step_number").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Services Page - CTA Section
export const servicesPageCTA = mysqlTable("services_page_cta", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    button_text: varchar("button_text", { length: 100 }).notNull(),
    button_link: varchar("button_link", { length: 512 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
