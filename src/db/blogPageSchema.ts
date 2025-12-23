import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// Blog Page Hero Section
export const blogPageHero = mysqlTable("blog_page_hero", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    subtitle: varchar("subtitle", { length: 512 }).notNull(),
    background_image: varchar("background_image", { length: 512 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Blog Page CTA Section
export const blogPageCTA = mysqlTable("blog_page_cta", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    button_text: varchar("button_text", { length: 100 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
