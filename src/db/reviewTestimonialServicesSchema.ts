import { foreignKey, int, mysqlTable, primaryKey } from "drizzle-orm/mysql-core";
import { reviewTestimonials } from "./reviewSchema";
import { servicePosts } from "./servicePostsSchema";

export const reviewTestimonialServices = mysqlTable(
    "review_testimonial_services",
    {
        testimonialId: int("testimonial_id").notNull(),
        serviceId: int("service_id").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.testimonialId, table.serviceId] }),
        testimonialFk: foreignKey({
            columns: [table.testimonialId],
            foreignColumns: [reviewTestimonials.id],
            name: "rt_svc_testimonial_fk",
        }).onDelete("cascade"),
        serviceFk: foreignKey({
            columns: [table.serviceId],
            foreignColumns: [servicePosts.id],
            name: "rt_svc_service_fk",
        }).onDelete("cascade"),
    })
);
