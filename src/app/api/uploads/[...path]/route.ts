import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const runtime = 'nodejs'

function getEnvUploadDir() {
    const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
    return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir)
}

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const types: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.bmp': 'image/bmp',
    }
    return types[ext] || 'application/octet-stream'
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params
        const pathSegments = resolvedParams.path || []

        if (pathSegments.length === 0) {
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
        }

        // Sanitize path to prevent directory traversal
        const sanitizedPath = pathSegments
            .map(segment => segment.replace(/\.\./g, ''))
            .join('/')

        const uploadsRoot = getEnvUploadDir()
        const filePath = path.join(uploadsRoot, sanitizedPath)

        // Ensure the resolved path is still under uploads directory
        const normalizedFilePath = path.resolve(filePath)
        const normalizedUploadsRoot = path.resolve(uploadsRoot)

        if (!normalizedFilePath.startsWith(normalizedUploadsRoot)) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
        }

        // Check if file exists
        try {
            await fs.access(filePath)
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Read the file
        const fileBuffer = await fs.readFile(filePath)
        const contentType = getContentType(filePath)

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
