import { drizzle } from 'drizzle-orm/mysql2';
import { createPool, type Pool } from 'mysql2/promise';
import 'dotenv/config';
import * as schema from './schema';
import * as homepageSchema from './homepageSchema';
import * as servicesPageSchema from './servicesPageSchema';
import * as servicePostsSchema from './servicePostsSchema';
import * as serviceCategoriesSchema from './serviceCategoriesSchema';
import * as aboutPageSchema from './aboutPageSchema';
import * as contactPageSchema from './contactPageSchema';
import * as faqPageSchema from './faqPageSchema';
import * as termsPageSchema from './termsPageSchema';
import * as blogPageSchema from './blogPageSchema';
import * as review from './reviewSchema';
import * as reviewTestimonialServices from './reviewTestimonialServicesSchema';
import * as reviewTestimonialProducts from './reviewTestimonialProductsSchema';
import * as navbarSchema from './navbarSchema';
import * as shopPageSchema from './shopPageSchema';
import * as projectsSchema from './projectsSchema';


// Singleton pattern for database connection to prevent "Too many connections" error in development
const globalForDb = global as unknown as { conn: Pool | undefined };

const pool = globalForDb.conn ?? createPool({
    uri: process.env.NODE_ENV === 'production' ? process.env.P_DB_URL! : process.env.DATABASE_URL!,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = pool;

export const db = drizzle(pool, {
    schema: {
        ...schema,
        ...homepageSchema,
        ...servicesPageSchema,
        ...servicePostsSchema,
        ...serviceCategoriesSchema,
        ...aboutPageSchema,
        ...contactPageSchema,
        ...faqPageSchema,
        ...termsPageSchema,
        ...blogPageSchema,
        ...review,
        ...reviewTestimonialServices,
        ...reviewTestimonialProducts,
        ...navbarSchema,
        ...shopPageSchema,
        ...projectsSchema
    },
    mode: 'default'
});
