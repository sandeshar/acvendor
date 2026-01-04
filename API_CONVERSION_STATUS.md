# API Conversion Status

## ✅ Completed Conversions

### 1. Authentication & Users
- **[src/app/api/login/route.ts](src/app/api/login/route.ts)** - ✅ Converted
  - Changed from Drizzle `db.select()` to Mongoose `User.findOne()`
  - Updated user access pattern (removed array indexing)
  - Added `connectDB()` call

- **[src/app/api/users/route.ts](src/app/api/users/route.ts)** - ✅ Converted
  - GET: `User.findById()` and `User.find()`
  - POST: `User.create()`
  - PUT: `User.findByIdAndUpdate()`
  - DELETE: `User.findByIdAndDelete()`

## 🔄 Remaining Conversions Needed

### High Priority APIs

#### Store & Settings
- [ ] `src/app/api/store-settings/route.ts` - Complex with footer sections/links
- [ ] `src/app/api/themes/route.ts`

#### Products
- [ ] `src/app/api/products/route.ts` - Large file (~590 lines) with complex queries
- [ ] `src/app/api/products/[...slug]/route.ts` (if exists)

#### Services
- [ ] `src/app/api/services/route.ts` - Complex with categories/subcategories
- [ ] `src/app/api/services/[slug]/route.ts` (if exists)

#### Navigation & Pages
- [ ] `src/app/api/navbar/route.ts`
- [ ] `src/app/api/footer-sections/route.ts`
- [ ] All files in `src/app/api/pages/` directory

#### Reviews & Testimonials
- [ ] `src/app/api/testimonial/route.ts` - Complex with many-to-many relationships

#### Projects
- [ ] `src/app/api/projects/route.ts`

#### Admin
- [ ] `src/app/api/admin/stats/route.ts`
- [ ] `src/app/api/admin/quotations/route.ts`
- [ ] Other admin routes

#### Blog
- [ ] All routes in `src/app/api/blog/` directory

#### SEO
- [ ] `src/app/api/seo/sitemap/generate/route.ts`
- [ ] `src/app/api/seo/sitemap/stats/route.ts`
- [ ] `src/app/api/seo/robots/route.ts`

#### Seed Routes
- [ ] All routes in `src/app/api/seed/` directory (about, contact, faq, services, products, etc.)

### Medium Priority APIs
- [ ] `src/app/api/upload/route.ts` - May not need changes if it's just file handling
- [ ] `src/app/api/logout/route.ts`
- [ ] `src/app/api/debug/` routes

## Conversion Strategy

### Automated Approach
For the remaining 70+ API files, you have two options:

1. **Manual Conversion** using the [API_CONVERSION_GUIDE.md](API_CONVERSION_GUIDE.md)
   - Follow the patterns documented
   - Use find-and-replace for common patterns
   - Test each endpoint after conversion

2. **Script-based Conversion** (recommended for bulk):
   Create a Node.js script to automate common conversions:
   ```javascript
   // Example conversion script structure
   const fs = require('fs');
   const path = require('path');
   
   function convertFile(filePath) {
       let content = fs.readFileSync(filePath, 'utf8');
       
       // Replace imports
       content = content.replace(
           /import { db } from ['"]@\/db['"];/g,
           "import { connectDB } from '@/db';"
       );
       
       content = content.replace(
           /import { eq, desc, asc, inArray, like, or, and } from ['"]drizzle-orm['"];/g,
           "// Mongoose operators are built-in"
       );
       
       // Add connectDB() calls
       content = content.replace(
           /(export async function \w+\([^)]+\) {\s+try {)/g,
           "$1\n        await connectDB();"
       );
       
       // Convert basic selects
       content = content.replace(
           /await db\.select\(\)\.from\((\w+)\)\.where\(eq\(\1\.id, ([^)]+)\)\)\.limit\(1\)/g,
           "await $1.findById($2).lean()"
       );
       
       // ... more replacements
       
       fs.writeFileSync(filePath, content, 'utf8');
   }
   ```

### Key Conversion Patterns to Apply

All APIs follow these patterns:

1. **Import Changes:**
   ```typescript
   // OLD
   import { db } from '@/db';
   import { tableName } from '@/db/schema';
   import { eq } from 'drizzle-orm';
   
   // NEW
   import { connectDB } from '@/db';
   import { ModelName } from '@/db/schema';
   ```

2. **Add Connection:**
   ```typescript
   export async function HANDLER(request: NextRequest) {
       try {
           await connectDB();  // Add this line
           // ... rest of code
       }
   }
   ```

3. **Query Conversions:**
   - `db.select().from(table).where(eq(table.id, id)).limit(1)` → `Model.findById(id).lean()`
   - `db.select().from(table)` → `Model.find().lean()`
   - `db.insert(table).values(data)` → `Model.create(data)`
   - `db.update(table).set(data).where(eq(table.id, id))` → `Model.findByIdAndUpdate(id, data, { new: true })`
   - `db.delete(table).where(eq(table.id, id))` → `Model.findByIdAndDelete(id)`

4. **Result Access:**
   ```typescript
   // OLD - Drizzle returns array
   const result = await db.select()...;
   if (result.length === 0) return notFound;
   return result[0];
   
   // NEW - Mongoose returns document or null
   const result = await Model.findById(id).lean();
   if (!result) return notFound;
   return result;
   ```

## Testing Plan

After converting all APIs:

1. **Start the Development Server:**
   ```bash
   npm run dev
   ```

2. **Update Environment Variables:**
   Ensure `DATABASE_URL` points to MongoDB:
   ```env
   DATABASE_URL=mongodb://localhost:27017/acvendor
   # or
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/acvendor
   ```

3. **Test Each Endpoint:**
   - Use Postman/Thunder Client or browser
   - Test all CRUD operations
   - Verify response format matches expectations
   - Check error handling

4. **Frontend Integration:**
   - Verify frontend components still work
   - Check if ObjectId vs integer ID causes issues
   - Update frontend if necessary to handle `_id` instead of `id`

## Migration Checklist

- [x] Install Mongoose (`npm install mongoose @types/mongoose`)
- [x] Convert database schemas (18 schema files)
- [x] Update `src/db/index.ts` with Mongoose connection
- [x] Convert authentication APIs (login, users)
- [ ] Convert all remaining API routes (70+ files)
- [ ] Test all endpoints
- [ ] Update frontend to handle MongoDB ObjectIds
- [ ] Migrate data from MySQL to MongoDB
- [ ] Update environment variables
- [ ] Deploy and test in production

## Notes

- All conversions maintain the same API interface
- Response formats should remain identical
- Error handling patterns are preserved
- The MongoDB ObjectId (`_id`) may require frontend updates if components expect numeric `id`
