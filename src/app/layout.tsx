import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastContainer from '@/components/Toast';

import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  // API-only metadata: mark page dynamic so this runs at request-time and internal API is available.
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    try {
      const res = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
      if (res.ok) {
        const payload = await res.json();
        const s = payload?.data || null;
        if (s) {
          const title = s.storeName || s.metaTitle || "Content Store";
          const description = s.metaDescription || s.storeDescription || "";
          // Version query to bust cache when updated
          const version = s?.updatedAt ? `?v=${encodeURIComponent(String(s.updatedAt))}` : `?v=${Date.now()}`;
          const faviconUrl = s.favicon ? `${s.favicon}${version}` : undefined;
          const storeLogoUrl = s.storeLogo ? `${s.storeLogo}${version}` : undefined;

          return {
            title,
            description,
            keywords: s.metaKeywords || "",
            robots: "index, follow",
            creator: s.storeName,
            publisher: s.storeName,
            // Use versioned URLs via Next metadata icons (avoid manual duplicate <link> tags in head)
            icons: s.favicon ? { icon: faviconUrl, apple: storeLogoUrl } : undefined,
            openGraph: {
              type: "website",
              locale: "en_US",
              url: base,
              siteName: s.storeName,
              title,
              description,
              images: storeLogoUrl ? [{ url: storeLogoUrl, alt: s.storeName }] : [],
            },
            twitter: {
              card: "summary_large_image",
              title,
              description,
              images: storeLogoUrl ? [storeLogoUrl] : [],
            },
            alternates: {
              canonical: base,
            },
          };
        }
      }
    } catch (e) {
      // If API is unavailable return defaults; avoid DB access here to keep all DB usage in API.
    }

    return {
      title: "Content Store",
      description: "",
    };
  } catch {
    return {
      title: "Content Store",
      description: "",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // API-only runtime fetch; mark dynamic above to avoid prerender-time fetch failures.
  let s: any = null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/store-settings`, { next: { tags: ['store-settings'] } });
    if (res.ok) {
      const payload = await res.json();
      s = payload?.data || null;
    }
  } catch (e) {
    // If API fails, use defaults — do not perform DB access here.
    s = null;
  }

  // JSON-LD structured data for Organization
  const jsonLd = s ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": s.storeName || s.store_name || undefined,
    "description": s.storeDescription || s.store_description || undefined,
    "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "logo": s.storeLogo || s.store_logo || undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": s.contactEmail || s.contact_email || undefined,
      "telephone": s.contactPhone || s.contact_phone || undefined,
      "contactType": "customer service"
    },
    "address": s.address ? {
      "@type": "PostalAddress",
      "addressLocality": s.address
    } : undefined,
    "sameAs": [
      s.facebook,
      s.twitter,
      s.instagram,
      s.linkedin
    ].filter(Boolean)
  } : null;

  const themeClass = `theme-${s?.theme ?? 'default'}`;

  // Compute a cache-busting version suffix and versioned asset URLs for head tags
  const version = s?.updatedAt ? `?v=${encodeURIComponent(String(s.updatedAt))}` : `?v=${Date.now()}`;
  const faviconUrl = s?.favicon ? `${s.favicon}${version}` : undefined;
  const storeLogoUrl = s?.storeLogo ? `${s.storeLogo}${version}` : undefined;

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols" rel="stylesheet" />

        {/* Explicit favicon links to ensure browsers pick up uploaded favicon immediately */}
        <link rel="icon" href={faviconUrl ?? '/favicon.ico'} />
        <link rel="apple-touch-icon" href={storeLogoUrl ?? (faviconUrl ?? '/favicon.ico')} />

        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID as string} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-display antialiased ${themeClass}`}>
        {children}        <ToastContainer />      </body>
    </html>
  );
}
