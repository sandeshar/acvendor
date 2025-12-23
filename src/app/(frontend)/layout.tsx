import { Metadata, Viewport } from "next";
export const dynamic = 'force-dynamic';
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
    // API-only metadata (dynamic) - avoid DB access in layouts; return defaults on failure
    try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
        if (res.ok) {
            const payload = await res.json();
            const s = payload?.data || null;
            if (s) {
                const title = s.metaTitle || s.storeName || "Content Store";
                const description = s.metaDescription || s.storeDescription || "";
                return {
                    title,
                    description,
                    keywords: s.metaKeywords || "",
                    robots: "index, follow",
                    creator: s.storeName,
                    publisher: s.storeName,
                    icons: s.favicon ? { icon: s.favicon } : undefined,
                    openGraph: {
                        type: "website",
                        locale: "en_US",
                        url: base,
                        siteName: s.storeName,
                        title,
                        description,
                        images: s.storeLogo ? [{ url: s.storeLogo, alt: s.storeName }] : [],
                    },
                    twitter: {
                        card: "summary_large_image",
                        title,
                        description,
                        images: s.storeLogo ? [s.storeLogo] : [],
                    },
                    alternates: {
                        canonical: base,
                    },
                };
            }
        }
    } catch (e) { }
    return {
        title: "Content Store",
        description: "",
    };
}

export default async function FrontendLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // API-only runtime: fetch store name from API and avoid direct DB access
    let storeName = "Content Solution Nepal";
    let storeLogo: string | null = null;
    let store: any = null;
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
        if (res.ok) {
            const payload = await res.json();
            store = payload?.data || null;
            storeName = store?.storeName || store?.store_name || storeName;
            storeLogo = store?.storeLogo || store?.store_logo || null;
        }
    } catch (e) {
        // If API fails, keep defaults but do not call DB directly
    }

    return (
        <>
            <NavBar storeName={storeName} storeLogo={storeLogo || undefined} store={store || undefined} />
            {children}
            <Footer storeName={storeName} storeLogo={storeLogo || undefined} store={store || undefined} />
        </>
    );
}
