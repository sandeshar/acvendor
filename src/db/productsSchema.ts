import { int, mysqlTable, timestamp, varchar, decimal, text } from "drizzle-orm/mysql-core";
import { serviceCategories, serviceSubcategories } from "./serviceCategoriesSchema";

// NOTE: Products use the central category manager tables (`service_categories` and `service_subcategories`).
// We do not create separate product category tables; instead products reference the category manager.

// Products table
export const products = mysqlTable("products", {
    id: int("id").primaryKey().autoincrement(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    title: varchar("title", { length: 512 }).notNull(),
    excerpt: varchar("excerpt", { length: 1024 }).notNull().default(''),
    content: text("content"),
    thumbnail: varchar("thumbnail", { length: 512 }),
    price: decimal("price", { precision: 10, scale: 2 }),
    compare_at_price: decimal("compare_at_price", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("NRS"),
    statusId: int("status_id").default(1).notNull(),
    featured: int("featured").default(0).notNull(),
    category_id: int("category_id").references(() => serviceCategories.id),
    subcategory_id: int("subcategory_id").references(() => serviceSubcategories.id),
    model: varchar("model", { length: 256 }),
    capacity: varchar("capacity", { length: 128 }),
    warranty: varchar("warranty", { length: 128 }),
    energy_saving: varchar("energy_saving", { length: 128 }),
    smart: int("smart").default(0).notNull(),
    filtration: int("filtration").default(0).notNull(),
    brochure_url: varchar("brochure_url", { length: 512 }),
    power: varchar("power", { length: 128 }),
    iseer: varchar("iseer", { length: 64 }),
    refrigerant: varchar("refrigerant", { length: 64 }),
    noise: varchar("noise", { length: 64 }),
    dimensions: varchar("dimensions", { length: 128 }),
    voltage: varchar("voltage", { length: 64 }),
    locations: text("locations"),
    inventory_status: varchar("inventory_status", { length: 64 }).default('in_stock'),
    rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
    reviews_count: int("reviews_count").default(0).notNull(),
    meta_title: varchar("meta_title", { length: 256 }),
    meta_description: varchar("meta_description", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Product images (gallery)
export const productImages = mysqlTable("product_images", {
    id: int("id").primaryKey().autoincrement(),
    product_id: int("product_id").references(() => products.id).notNull(),
    url: varchar("url", { length: 512 }).notNull(),
    alt: varchar("alt", { length: 256 }).notNull().default(''),
    is_primary: int("is_primary").default(0).notNull(),
    display_order: int("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
