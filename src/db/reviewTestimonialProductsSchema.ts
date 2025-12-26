import { foreignKey, int, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";
import { reviewTestimonials } from "./reviewSchema";
import { products } from "./productsSchema";

export const reviewTestimonialProducts = mysqlTable(
    "review_testimonial_products",
    {
        testimonialId: int("testimonial_id").notNull(),
        productId: int("product_id").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.testimonialId, table.productId] }),
        testimonialFk: foreignKey({
            columns: [table.testimonialId],
            foreignColumns: [reviewTestimonials.id],
            name: "rt_prd_testimonial_fk",
        }).onDelete("cascade"),
        productFk: foreignKey({
            columns: [table.productId],
            foreignColumns: [products.id],
            name: "rt_prd_product_fk",
        }).onDelete("cascade"),
    })
);