# PowerShell script to convert all remaining API route files from Drizzle to Mongoose
# This script performs text replacements across all route files

$routes = @(
    "about/certifications",
    "about/certifications-section",
    "about/cta",
    "blog/hero",
    "blog/cta",
    "contact/hero",
    "contact/info",
    "contact/form-config",
    "contact/submissions",
    "faq/header",
    "faq/categories",
    "faq/items",
    "faq/cta",
    "homepage/hero",
    "homepage/expertise-section",
    "homepage/expertise-items",
    "homepage/contact-section",
    "homepage/trust-section",
    "homepage/trust-logos",
    "services/hero",
    "services/cta",
    "services/features",
    "services/details",
    "services/trust",
    "services/process-section",
    "services/process-steps",
    "services/categories",
    "services/subcategories",
    "services/brands",
    "shop/hero",
    "shop/brand-hero",
    "terms/header",
    "terms/sections",
    "projects/section"
)

foreach ($route in $routes) {
    $filePath = "d:\acvendor\src\app\api\pages\$route\route.ts"
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $filePath"
        
        $content = Get-Content $filePath -Raw
        
        # Replace imports
        $content = $content -replace "import \{ db \} from '@/db';", "import { connectDB } from '@/db';"
        $content = $content -replace "import \{ eq, asc, desc.*? \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ eq, asc \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ eq, desc \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ eq \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ asc \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ desc \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ eq, or \} from 'drizzle-orm';", ""
        $content = $content -replace "import \{ or, eq \} from 'drizzle-orm';", ""
        
        # Add connectDB() calls at start of each handler
        $content = $content -replace "export async function GET\(([^)]*)\) \{\s*try \{", "export async function GET(`$1) {`n    try {`n        await connectDB();"
        $content = $content -replace "export async function POST\(([^)]*)\) \{\s*try \{", "export async function POST(`$1) {`n    try {`n        await connectDB();"
        $content = $content -replace "export async function PUT\(([^)]*)\) \{\s*try \{", "export async function PUT(`$1) {`n    try {`n        await connectDB();"
        $content = $content -replace "export async function DELETE\(([^)]*)\) \{\s*try \{", "export async function DELETE(`$1) {`n    try {`n        await connectDB();"
        
        # Save the file
        Set-Content $filePath $content -NoNewline
        
        Write-Host "Completed: $filePath" -ForegroundColor Green
    }
    else {
        Write-Host "File not found: $filePath" -ForegroundColor Yellow
    }
}

Write-Host "`nPhase 1 complete. Import statements updated." -ForegroundColor Cyan
Write-Host "Note: Manual conversion of query patterns still needed for each file." -ForegroundColor Yellow
