# Bulk conversion script for remaining API routes from Drizzle to Mongoose
# This script will be used to track conversion progress

$files = @(
    "src/app/api/pages/homepage/hero/route.ts",
    "src/app/api/pages/homepage/expertise-section/route.ts",
    "src/app/api/pages/homepage/expertise-items/route.ts",
    "src/app/api/pages/homepage/contact-section/route.ts",
    "src/app/api/pages/homepage/trust-section/route.ts",
    "src/app/api/pages/homepage/trust-logos/route.ts",
    "src/app/api/pages/services/hero/route.ts",
    "src/app/api/pages/services/cta/route.ts",
    "src/app/api/pages/services/features/route.ts",
    "src/app/api/pages/services/details/route.ts",
    "src/app/api/pages/services/trust/route.ts",
    "src/app/api/pages/services/process-section/route.ts",
    "src/app/api/pages/services/process-steps/route.ts",
    "src/app/api/pages/services/categories/route.ts",
    "src/app/api/pages/services/subcategories/route.ts",
    "src/app/api/pages/services/brands/route.ts",
    "src/app/api/pages/shop/hero/route.ts",
    "src/app/api/pages/shop/brand-hero/route.ts",
    "src/app/api/pages/terms/header/route.ts",
    "src/app/api/pages/terms/sections/route.ts",
    "src/app/api/pages/projects/section/route.ts"
)

Write-Host "Files remaining to convert: $($files.Count)" -ForegroundColor Yellow
Write-Host "Contact pages (info, form-config, submissions): DONE" -ForegroundColor Green
Write-Host "FAQ pages (header, categories, items, cta): DONE" -ForegroundColor Green
Write-Host "Homepage, Services, Shop, Terms, Projects: IN PROGRESS" -ForegroundColor Cyan
