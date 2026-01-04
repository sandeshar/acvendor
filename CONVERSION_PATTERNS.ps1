# Complete API Route Mongoose Conversion Script
# This script documents the exact changes needed for all remaining files

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "MONGOOSE CONVERSION - REMAINING FILES" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

$conversions = @"

ALL REMAINING FILES FOLLOW THESE PATTERNS:

1. IMPORTS:
   - Remove: import { eq, desc, asc, and, or } from 'drizzle-orm';
   - Remove: import { db } from '@/db';
   - Add: import { connectDB } from '@/db';
   - Change model imports to PascalCase (e.g., ServicesPageCTA, ShopPageHero)

2. GET HANDLERS:
   - Add: await connectDB(); at start
   - db.select().from(X).where(eq(X.id, id)).limit(1) → await X.findById(id).lean()
   - Check: if (rows.length === 0) → if (!row)
   - Return: rows[0] → row
   - db.select().from(X).where(eq(X.is_active, 1)) → await X.findOne({ is_active: 1 }).lean()
   - db.select().from(X).orderBy(asc(X.display_order)) → await X.find().sort({ display_order: 1 }).lean()
   - desc() → sort({ field: -1 })

3. POST HANDLERS:
   - Add: await connectDB(); at start
   - db.insert(X).values(data) → await X.create(data)
   - result[0].insertId → result._id

4. PUT HANDLERS:
   - Add: await connectDB(); at start
   - db.update(X).set(data).where(eq(X.id, id)) → await X.findByIdAndUpdate(id, data, { new: true })

5. DELETE HANDLERS:
   - Add: await connectDB(); at start
   - db.delete(X).where(eq(X.id, parseInt(id))) → await X.findByIdAndDelete(id)

COMPLETED: 14 files
REMAINING: 15 files

For the remaining files, apply the patterns above systematically to each file.
All imports, queries, and responses must be updated following these exact patterns.

"@

Write-Host $conversions -ForegroundColor White

Write-Host "`n" + "=" * 80 -ForegroundColor Green
Write-Host "CONVERSION PATTERNS ESTABLISHED" -ForegroundColor Green  
Write-Host "Apply these patterns to all remaining files" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
