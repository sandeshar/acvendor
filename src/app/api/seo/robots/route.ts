import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storeSettings } from '@/db/schema';
import fs from 'fs/promises';
import path from 'path';

const ROBOTS_FILE = path.join(process.cwd(), 'public', 'robots.txt');

async function ensurePublicDir() {
    const publicDir = path.join(process.cwd(), 'public');
    try {
        await fs.access(publicDir);
    } catch {
        await fs.mkdir(publicDir, { recursive: true });
    }
}

export async function GET() {
    try {
        await ensurePublicDir();
        try {
            const content = await fs.readFile(ROBOTS_FILE, 'utf-8');
            return NextResponse.json({ success: true, content });
        } catch {
            // Default robots.txt if file doesn't exist
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const defaultContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
            return NextResponse.json({ success: true, content: defaultContent });
        }
    } catch (error) {
        console.error('GET /api/seo/robots error', error);
        return NextResponse.json({ success: false, error: 'Failed to read robots.txt' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { content } = await request.json();
        if (typeof content !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid content' }, { status: 400 });
        }

        await ensurePublicDir();
        await fs.writeFile(ROBOTS_FILE, content, 'utf-8');
        return NextResponse.json({ success: true, message: 'robots.txt updated' });
    } catch (error) {
        console.error('PUT /api/seo/robots error', error);
        return NextResponse.json({ success: false, error: 'Failed to save robots.txt' }, { status: 500 });
    }
}
