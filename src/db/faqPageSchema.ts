import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// FAQ Page Header Section
export const faqPageHeader = mysqlTable("faq_page_header", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    search_placeholder: varchar("search_placeholder", { length: 256 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// FAQ Categories
export const faqCategories = mysqlTable("faq_categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// FAQ Items
export const faqItems = mysqlTable("faq_items", {
    id: int("id").primaryKey().autoincrement(),
    category_id: int("category_id").references(() => faqCategories.id).notNull(),
    question: varchar("question", { length: 512 }).notNull(),
    answer: varchar("answer", { length: 2048 }).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// FAQ Page CTA Section
export const faqPageCTA = mysqlTable("faq_page_cta", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    description: varchar("description", { length: 512 }).notNull(),
    button_text: varchar("button_text", { length: 100 }).notNull(),
    button_link: varchar("button_link", { length: 512 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
