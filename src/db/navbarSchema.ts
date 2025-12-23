import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const navbarItems = mysqlTable("navbar_items", {
    id: int("id").autoincrement().primaryKey(),
    label: varchar("label", { length: 100 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
    order: int("order").default(0).notNull(),
    parent_id: int("parent_id"),
    is_button: int("is_button").default(0).notNull(), // 0 = link, 1 = button
    is_dropdown: int("is_dropdown").default(0).notNull(), // 0 = normal, 1 = dropdown that contains children
    is_active: int("is_active").default(1).notNull(), // 0 = hidden, 1 = visible
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
