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

    // Text fields (editable copy for contact page UI)
    info_title: varchar("info_title", { length: 128 }).notNull().default('Contact Information'),
    info_description: varchar("info_description", { length: 512 }).notNull().default("Reaching out for a repair, new installation, or general inquiry? We're just a call away."),
    // Map overlay description (short blurb shown over map)
    map_description: varchar("map_description", { length: 256 }).notNull().default('Get directions to our main office for product demos and consultations.'),
    phone_item_1_subtext: varchar("phone_item_1_subtext", { length: 128 }).notNull().default('Sales Hotline (24/7)'),
    phone_item_2_subtext: varchar("phone_item_2_subtext", { length: 128 }).notNull().default('Service Support & Repairs'),
    whatsapp_title: varchar("whatsapp_title", { length: 128 }).notNull().default('Chat on WhatsApp'),
    whatsapp_subtext: varchar("whatsapp_subtext", { length: 128 }).notNull().default('Get instant quotes & support'),
    location_title: varchar("location_title", { length: 128 }).notNull().default('Head Office'),
    opening_hours_title: varchar("opening_hours_title", { length: 128 }).notNull().default('Opening Hours'),
    opening_hours_text: varchar("opening_hours_text", { length: 512 }).notNull().default("Sun - Fri: 9:00 AM - 6:00 PM\nSaturday: Closed"),

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
