import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// Terms Page Header
export const termsPageHeader = mysqlTable("terms_page_header", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    last_updated: varchar("last_updated", { length: 100 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Terms Page Sections
export const termsPageSections = mysqlTable("terms_page_sections", {
    id: int("id").primaryKey().autoincrement(),
    title: varchar("title", { length: 256 }).notNull(),
    content: varchar("content", { length: 5000 }).notNull(),
    has_email: int("has_email").default(0).notNull(),
    display_order: int("display_order").notNull(),
    is_active: int("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
