import { int, mysqlTable, timestamp, varchar, text } from "drizzle-orm/mysql-core";

// Service Categories (Parent)
export const serviceCategories = mysqlTable("service_categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    // Optional brand slug (e.g., 'midea', 'lg') to support brand-scoped categories
    brand: varchar("brand", { length: 128 }),
    description: text("description"),
    icon: varchar("icon", { length: 100 }), // Material icon name
    thumbnail: varchar("thumbnail", { length: 512 }), // Category image
    display_order: int("display_order").default(0).notNull(),
    is_active: int("is_active").default(1).notNull(),
    meta_title: varchar("meta_title", { length: 256 }),
    meta_description: varchar("meta_description", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Service Subcategories (Child of Categories)
export const serviceSubcategories = mysqlTable("service_subcategories", {
    id: int("id").primaryKey().autoincrement(),
    category_id: int("category_id").references(() => serviceCategories.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    // Optional AC type (e.g., 'Inverter', 'Window', 'Split') to further categorize subcategories
    ac_type: varchar("ac_type", { length: 128 }),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 100 }), // Material icon name
    thumbnail: varchar("thumbnail", { length: 512 }), // Subcategory image
    display_order: int("display_order").default(0).notNull(),
    is_active: int("is_active").default(1).notNull(),
    meta_title: varchar("meta_title", { length: 256 }),
    meta_description: varchar("meta_description", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
