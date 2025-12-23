import { int, mysqlTable, timestamp, varchar, text } from "drizzle-orm/mysql-core";

// Service Categories (Parent)
export const serviceCategories = mysqlTable("service_categories", {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
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
