import SideBar from "@/components/Sidebar"
import AdminHeader from "@/components/AdminHeader"
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkAuth } from "@/utils/authHelper";
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const base = process.env.NEXT_PUBLIC_BASE_URL;
        if (base) {
            try {
                const res = await fetch(`${base}/api/store-settings`, { next: { tags: ['store-settings'] } });
                if (res.ok) {
                    const payload = await res.json();
                    const s = payload?.data;
                    const siteName = s?.storeName || "Content Store";
                    return {
                        title: `Admin | ${siteName}`,
                        description: `Admin dashboard for ${siteName}`,
                        robots: "noindex, nofollow",
                        creator: siteName,
                        publisher: siteName,
                    };
                }
            } catch (e) {
                // ignore and fallback to DB
            }
        }

        // If API fails return a safe default rather than accessing DB directly
        return {
            title: `Admin | Content Store`,
            description: `Admin dashboard for Content Store`,
            robots: "noindex, nofollow",
            creator: "Content Store",
            publisher: "Content Store",
        };
    } catch {
        return {
            title: "Admin | Content Store",
            robots: "noindex, nofollow",
        };
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <AdminHeader />
            <div className="flex flex-1 min-w-0">
                <SideBar />
                <main className="admin-main flex-1 min-w-0">{children}</main>
            </div>
        </div>

    )
}
