import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: [
        './src/db/schema.ts',
        './src/db/homepageSchema.ts',
        './src/db/servicesPageSchema.ts',
        './src/db/servicePostsSchema.ts',
        './src/db/serviceCategoriesSchema.ts', './src/db/productsSchema.ts', './src/db/aboutPageSchema.ts',
        './src/db/contactPageSchema.ts',
        './src/db/faqPageSchema.ts',
        './src/db/termsPageSchema.ts',
        './src/db/blogPageSchema.ts',
        './src/db/reviewSchema.ts',
        './src/db/reviewTestimonialServicesSchema.ts',
        './src/db/reviewTestimonialProductsSchema.ts',
        './src/db/navbarSchema.ts',
        './src/db/shopPageSchema.ts',
    ],
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.NODE_ENV === 'production' ? process.env.P_DB_URL! : process.env.DATABASE_URL!,
    },
});
