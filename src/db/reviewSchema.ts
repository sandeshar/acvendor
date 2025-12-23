import { datetime, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { servicePosts } from "./servicePostsSchema";
import { url } from "inspector";

export const reviewTestimonials = mysqlTable("review_testimonials", {
    id: int("id").primaryKey().autoincrement(),
    url: varchar("url", { length: 512 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    role: varchar("role", { length: 256 }).notNull(),
    content: varchar("content", { length: 65535 }).notNull(),
    rating: int("rating").notNull(),
    service: int("service").references(() => servicePosts.id, { onDelete: 'cascade' }),
    link: varchar("link", { length: 256 }).notNull().default('homepage'),
    date: timestamp("date").defaultNow().notNull(),
});