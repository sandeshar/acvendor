import mongoose from 'mongoose';
import 'dotenv/config';

// Import all models - Mongoose version
export * from './schema';
export * from './homepageSchema';
export * from './servicesPageSchema';
export * from './servicePostsSchema';
export * from './serviceCategoriesSchema';
export * from './aboutPageSchema';
export * from './contactPageSchema';
export * from './faqPageSchema';
export * from './termsPageSchema';
export * from './blogPageSchema';
export * from './blogCategoriesSchema';
export * from './reviewSchema';
export * from './reviewTestimonialServicesSchema';
export * from './reviewTestimonialProductsSchema';
export * from './navbarSchema';
export * from './shopPageSchema';
export * from './projectsSchema';
export * from './productsSchema';
export * from './quotationsSchema';

// Singleton pattern for database connection to prevent "Too many connections" error in development
const globalForDb = global as unknown as { mongoose: typeof mongoose | undefined };

const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.P_DB_URL! : process.env.DATABASE_URL!;

if (!MONGODB_URI) {
    throw new Error('Please define the DATABASE_URL environment variable');
}

let cached = globalForDb.mongoose;

if (!cached) {
    cached = globalForDb.mongoose = mongoose;
}

export async function connectDB() {
    if (cached && mongoose.connection.readyState === 1) {
        return mongoose;
    }

    const opts = {
        bufferCommands: false,
    };

    await mongoose.connect(MONGODB_URI, opts);

    return mongoose;
}

// Auto-connect on import in production
if (process.env.NODE_ENV === 'production') {
    connectDB().catch(console.error);
}

// Backward compatibility: export db object
// Note: This is a stub for migration - old Drizzle code needs to be updated to use Mongoose models
export const db = {
    // This is a migration helper - code using db.select/insert/update/delete needs to be converted to Mongoose
    __mongoose: true,
    __deprecated: 'Use Mongoose models directly instead of db object'
};

export default mongoose;
