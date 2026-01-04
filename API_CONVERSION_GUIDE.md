# API Conversion Guide: Drizzle to Mongoose

## Quick Reference

### Common Patterns

#### 1. Imports
**Before (Drizzle):**
```typescript
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc, asc, inArray, like, or, and } from 'drizzle-orm';
```

**After (Mongoose):**
```typescript
import { connectDB } from '@/db';
import { User } from '@/db/schema';
// No need for query operators - they're built into Mongoose
```

#### 2. Connection
**Add at the start of each handler:**
```typescript
await connectDB();
```

#### 3. CRUD Operations

##### SELECT (READ)
**Drizzle:**
```typescript
// Find by ID
const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
if (user.length === 0) { /* not found */ }
return user[0];

// Find all
const allUsers = await db.select().from(users);

// Find with conditions
const activeUsers = await db.select().from(users).where(eq(users.is_active, 1));
```

**Mongoose:**
```typescript
// Find by ID
const user = await User.findById(id).lean();
if (!user) { /* not found */ }
return user;

// Find all
const allUsers = await User.find().lean();

// Find with conditions
const activeUsers = await User.find({ is_active: 1 }).lean();
```

##### INSERT (CREATE)
**Drizzle:**
```typescript
const result = await db.insert(users).values({
    name,
    email,
    password: hashedPassword
});
```

**Mongoose:**
```typescript
const user = await User.create({
    name,
    email,
    password: hashedPassword
});
// or
const user = new User({ name, email, password: hashedPassword });
await user.save();
```

##### UPDATE
**Drizzle:**
```typescript
await db.update(users).set({ name, email }).where(eq(users.id, id));
```

**Mongoose:**
```typescript
const updated = await User.findByIdAndUpdate(
    id, 
    { name, email }, 
    { new: true } // returns updated document
);
// or
await User.updateOne({ _id: id }, { name, email });
```

##### DELETE
**Drizzle:**
```typescript
await db.delete(users).where(eq(users.id, id));
```

**Mongoose:**
```typescript
await User.findByIdAndDelete(id);
// or
await User.deleteOne({ _id: id });
```

#### 4. Query Operators

##### WHERE with eq()
**Drizzle:**
```typescript
const user = await db.select().from(users).where(eq(users.email, email));
```

**Mongoose:**
```typescript
const user = await User.findOne({ email }).lean();
```

##### WHERE with multiple conditions (AND)
**Drizzle:**
```typescript
import { and, eq } from 'drizzle-orm';
const items = await db.select()
    .from(table)
    .where(and(eq(table.active, 1), eq(table.category_id, catId)));
```

**Mongoose:**
```typescript
const items = await Model.find({ 
    active: 1, 
    category_id: catId 
}).lean();
```

##### WHERE with OR
**Drizzle:**
```typescript
import { or, eq } from 'drizzle-orm';
const items = await db.select()
    .from(table)
    .where(or(eq(table.status, 1), eq(table.status, 2)));
```

**Mongoose:**
```typescript
const items = await Model.find({
    $or: [{ status: 1 }, { status: 2 }]
}).lean();
```

##### LIKE (Search)
**Drizzle:**
```typescript
import { like } from 'drizzle-orm';
const items = await db.select()
    .from(products)
    .where(like(products.title, `%${search}%`));
```

**Mongoose:**
```typescript
const items = await Product.find({
    title: { $regex: search, $options: 'i' }
}).lean();
```

##### IN Array
**Drizzle:**
```typescript
import { inArray } from 'drizzle-orm';
const items = await db.select()
    .from(table)
    .where(inArray(table.id, [1, 2, 3]));
```

**Mongoose:**
```typescript
const items = await Model.find({
    _id: { $in: [id1, id2, id3] }
}).lean();
```

#### 5. Sorting

**Drizzle:**
```typescript
import { desc, asc } from 'drizzle-orm';
const items = await db.select()
    .from(products)
    .orderBy(desc(products.createdAt));
```

**Mongoose:**
```typescript
const items = await Product.find()
    .sort({ createdAt: -1 })  // -1 for desc, 1 for asc
    .lean();
```

#### 6. Limit & Skip

**Drizzle:**
```typescript
const items = await db.select()
    .from(products)
    .limit(10)
    .offset(20);
```

**Mongoose:**
```typescript
const items = await Product.find()
    .limit(10)
    .skip(20)
    .lean();
```

#### 7. Joins (Populate)

**Drizzle:**
```typescript
const posts = await db.select()
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(eq(blogPosts.status, 2));
```

**Mongoose:**
```typescript
const posts = await BlogPost.find({ status: 2 })
    .populate('authorId')  // Mongoose auto-populates by ref
    .lean();
```

#### 8. Count

**Drizzle:**
```typescript
const result = await db.select().from(users);
const count = result.length;
```

**Mongoose:**
```typescript
const count = await User.countDocuments();
// or with filter
const activeCount = await User.countDocuments({ is_active: 1 });
```

## Important Notes

### 1. `.lean()`
Always add `.lean()` to queries that return data for API responses. This returns plain JavaScript objects instead of Mongoose documents, improving performance:

```typescript
const users = await User.find().lean();  // ✅ Good for API
const users = await User.find();          // ❌ Returns Mongoose documents
```

### 2. ObjectId vs Integer
- Drizzle used integer IDs: `id: int("id").primaryKey().autoincrement()`
- Mongoose uses ObjectId: `_id: ObjectId`

**Conversion:**
```typescript
// Drizzle
const user = await db.select().from(users).where(eq(users.id, parseInt(id)));

// Mongoose - no parsing needed, pass string directly
const user = await User.findById(id);
```

### 3. Field Names
- MongoDB _id field: Use `_id` or `id` getter
- Timestamps: `createdAt`, `updatedAt` (camelCase in Mongoose)
- Snake_case fields remain as defined in schema

### 4. References
```typescript
// In schema
authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }

// Populating
const posts = await BlogPost.find().populate('authorId').lean();
```

### 5. Decimal Fields
Price fields using Decimal128:
```typescript
// Access decimal value
product.price.toString()  // "99.99"
// or in schema transformation
```

## API File Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db';
import { Model } from '@/db/schema';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const id = request.nextUrl.searchParams.get('id');
        
        if (id) {
            const item = await Model.findById(id).lean();
            if (!item) {
                return NextResponse.json(
                    { error: 'Item not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(item);
        }
        
        const items = await Model.find().lean();
        return NextResponse.json(items);
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch items' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const item = await Model.create(body);
        
        return NextResponse.json(item);
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create item' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        
        const { id, ...updateData } = await request.json();
        
        const item = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(item);
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        
        const id = request.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }
        
        await Model.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
```

## Testing Checklist

After converting each API:
- [ ] All CRUD operations work
- [ ] Query filters work correctly
- [ ] Sorting works
- [ ] Pagination works
- [ ] Referenced documents populate correctly
- [ ] Error handling is maintained
- [ ] Response format matches frontend expectations
