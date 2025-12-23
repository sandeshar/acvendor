import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// Contact Page Hero Section
export const contactPageHero = mysqlTable("contact_page_hero", {
    id: int("id").primaryKey().autoincrement(),
    tagline: varchar("tagline", { length: 100 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    description: varchar("description", { length: 1024 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contact Page Info Section
export const contactPageInfo = mysqlTable("contact_page_info", {
    id: int("id").primaryKey().autoincrement(),
    office_location: varchar("office_location", { length: 256 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    map_url: varchar("map_url", { length: 1024 }).notNull(), // Google Maps embed URL
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contact Page Highlights Section removed (unused on frontend)

// Contact Page Form Configuration
export const contactPageFormConfig = mysqlTable("contact_page_form_config", {
    id: int("id").primaryKey().autoincrement(),
    name_placeholder: varchar("name_placeholder", { length: 100 }).notNull(),
    email_placeholder: varchar("email_placeholder", { length: 100 }).notNull(),
    phone_placeholder: varchar("phone_placeholder", { length: 100 }),
    subject_placeholder: varchar("subject_placeholder", { length: 100 }).notNull(),
    service_placeholder: varchar("service_placeholder", { length: 100 }).notNull(),
    message_placeholder: varchar("message_placeholder", { length: 100 }).notNull(),
    submit_button_text: varchar("submit_button_text", { length: 100 }).notNull(),
    success_message: varchar("success_message", { length: 512 }).notNull(),
    is_active: int("is_active").default(1).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Contact Form Submissions
export const contactFormSubmissions = mysqlTable("contact_form_submissions", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    subject: varchar("subject", { length: 512 }),
    service: varchar("service", { length: 256 }),
    message: varchar("message", { length: 65535 }).notNull(),
    status: varchar("status", { length: 50 }).default("new").notNull(), // new, read, replied, archived
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
