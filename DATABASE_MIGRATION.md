# Database Schema Migration - Drizzle to Mongoose

## Overview
This project has been migrated from Drizzle ORM with MySQL to Mongoose ODM with MongoDB.

## Changes Made

### 1. Dependencies
- **Added**: `mongoose` and `@types/mongoose`
- **Previous**: Used `drizzle-orm` and `mysql2`

### 2. Database Connection (src/db/index.ts)
- Replaced MySQL connection pool with Mongoose connection
- Connection string now expects MongoDB URI (not MySQL)
- Uses singleton pattern to prevent multiple connections
- Auto-connects in production environment

### 3. Schema Definitions
All schema files have been converted from Drizzle to Mongoose:

#### Main Schemas:
- **schema.ts**: Users, BlogPosts, Status, StoreSettings, FooterSections, FooterLinks
- **homepageSchema.ts**: Homepage Hero, Trust Logos, Trust Section, Expertise Section/Items, Contact Section
- **productsSchema.ts**: Products, ProductImages
- **servicesPageSchema.ts**: Services Hero, Details, Process, CTA, Brands, Trust, Features
- **serviceCategoriesSchema.ts**: ServiceCategories, ServiceSubcategories
- **servicePostsSchema.ts**: ServicePosts
- **aboutPageSchema.ts**: About Hero, Journey, Stats, Features, Certifications, Philosophy, Principles, Team
- **contactPageSchema.ts**: Contact Hero, Info, Form Config, Form Submissions
- **faqPageSchema.ts**: FAQ Header, Categories, Items, CTA
- **termsPageSchema.ts**: Terms Header, Sections
- **blogPageSchema.ts**: Blog Hero, CTA
- **reviewSchema.ts**: ReviewTestimonials
- **navbarSchema.ts**: NavbarItems
- **shopPageSchema.ts**: ShopPageHero, ShopPageBrandHero
- **projectsSchema.ts**: ProjectsSection, Projects
- **reviewTestimonialServicesSchema.ts**: ReviewTestimonialServices (Many-to-Many)
- **reviewTestimonialProductsSchema.ts**: ReviewTestimonialProducts (Many-to-Many)

### 4. Key Mongoose Features Implemented

#### Default Values
All schemas include appropriate default values:
```javascript
is_active: { type: Number, default: 1, required: true }
featured: { type: Number, default: 0, required: true }
theme: { type: String, default: 'light', maxlength: 100 }
```

#### Timestamps
Automatic timestamp handling:
```javascript
{ 
  timestamps: true  // Creates createdAt and updatedAt
}
```

Custom timestamp fields:
```javascript
{ 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
```

#### References
ObjectId references for relationships:
```javascript
authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
category_id: { type: Schema.Types.ObjectId, ref: 'ServiceCategories' }
```

#### Model Export Pattern
Prevents recompilation issues in Next.js:
```javascript
export const User = models.User || model('User', userSchema);
```

## Environment Variables

Update your `.env` file to use MongoDB connection strings:

```env
# Development
DATABASE_URL=mongodb://localhost:27017/acvendor

# Production
P_DB_URL=mongodb+srv://username:password@cluster.mongodb.net/acvendor
```

## Migration Notes

### Data Types Mapping
- **int → Number**
- **varchar → String** (with maxlength)
- **text → String**
- **decimal → mongoose.Schema.Types.Decimal128**
- **timestamp → Date** (handled by timestamps option)
- **Foreign keys → Schema.Types.ObjectId with ref**

### Numeric Fields
- **Booleans**: Represented as Numbers (0/1) to maintain compatibility
- **Decimals**: Using Decimal128 for price fields

### JSON Fields
Fields storing JSON arrays (like bullets, locations, features) are stored as Strings:
```javascript
bullets: { type: String, required: true, default: '[]' }
```

## Usage

### Connecting to Database
```javascript
import { connectDB } from '@/db';

await connectDB();
```

### Querying Data
```javascript
import { User } from '@/db/schema';

// Find all users
const users = await User.find();

// Find by ID
const user = await User.findById(userId);

// Create new user
const newUser = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: hashedPassword
});
```

### Relationships
```javascript
import { BlogPost } from '@/db/schema';

// Populate author
const posts = await BlogPost.find()
  .populate('authorId')
  .populate('status');
```

## Next Steps

1. **Update API Routes**: Replace Drizzle queries with Mongoose methods
2. **Test All Endpoints**: Verify CRUD operations work correctly
3. **Data Migration**: Migrate existing MySQL data to MongoDB
4. **Update Types**: Adjust TypeScript interfaces if needed

## Important Notes

- All models use the `models` cache pattern to prevent recompilation in Next.js
- Collection names are explicitly set to match existing database structure
- Default values are set where appropriate
- Timestamps are configured to match existing column names where needed
