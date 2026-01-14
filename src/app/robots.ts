import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
        try {
            const headersList = await headers();
            const host = headersList.get('host');
            const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
            if (host) {
                baseUrl = `${protocol}://${host}`;
            }
        } catch (error) {
            console.warn('Could not determine base URL from headers', error);
        }
    }

    baseUrl = baseUrl || 'http://localhost:3000';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
