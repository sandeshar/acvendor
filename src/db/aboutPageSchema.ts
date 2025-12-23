import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// About Page Hero Section
export const aboutPageHero = mysqlTable("about_page_hero", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 512 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    button1_text: varchar("button1_text", { length: 100 }).notNull(),
    button1_link: varchar("button1_link", { length: 512 }).notNull(),
    button2_text: varchar("button2_text", { length: 100 }).notNull(),
    button2_link: varchar("button2_link", { length: 512 }).notNull(),
    hero_image: varchar("hero_image", { length: 512 }).notNull(),
    hero_image_alt: varchar("hero_image_alt", { length: 256 }).notNull(),
    badge_text: varchar("badge_text", { length: 128 }).notNull().default(''),
    highlight_text: varchar("highlight_text", { length: 256 }).notNull().default(''),
    // Floating UI element - top card
    float_top_enabled: int("float_top_enabled").default(1).notNull(),
    float_top_icon: varchar("float_top_icon", { length: 100 }).notNull().default('trending_up'),
    float_top_title: varchar("float_top_title", { length: 128 }).notNull().default('Traffic Growth'),
    float_top_value: varchar("float_top_value", { length: 64 }).notNull().default('+145%'),
    // Floating UI element - bottom card
    float_bottom_enabled: int("float_bottom_enabled").default(1).notNull(),
    float_bottom_icon: varchar("float_bottom_icon", { length: 100 }).notNull().default('article'),
    float_bottom_title: varchar("float_bottom_title", { length: 128 }).notNull().default('Content Pieces'),
    float_bottom_value: varchar("float_bottom_value", { length: 64 }).notNull().default('5k+'),
    rating_text: varchar("rating_text", { length: 128 }).notNull().default(''),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// About Page Journey Section
export const aboutPageJourney = mysqlTable("about_page_journey", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    paragraph1: varchar("paragraph1", { length: 1024 }).notNull(),
    paragraph2: varchar("paragraph2", { length: 1024 }).notNull(),
    thinking_box_title: varchar("thinking_box_title", { length: 256 }).notNull(),
    thinking_box_content: varchar("thinking_box_content", { length: 1024 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aboutPageStats = mysqlTable("about_page_stats", {
    id: int("id").primaryKey().autoincrement(),
    label: varchar("label", { length: 100 }).notNull(),
    value: varchar("value", { length: 50 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aboutPageFeatures = mysqlTable("about_page_features", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// About Page Philosophy Section
export const aboutPagePhilosophy = mysqlTable("about_page_philosophy", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aboutPagePrinciples = mysqlTable("about_page_principles", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// About Page Team Section
export const aboutPageTeamSection = mysqlTable("about_page_team_section", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aboutPageTeamMembers = mysqlTable("about_page_team_members", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
    role: varchar("role", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    image: varchar("image", { length: 512 }).notNull(),
    image_alt: varchar("image_alt", { length: 256 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// About Page CTA Section
export const aboutPageCTA = mysqlTable("about_page_cta", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    primary_button_text: varchar("primary_button_text", { length: 100 }).notNull(),
    primary_button_link: varchar("primary_button_link", { length: 512 }).notNull(),
    secondary_button_text: varchar("secondary_button_text", { length: 100 }).notNull(),
    secondary_button_link: varchar("secondary_button_link", { length: 512 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
