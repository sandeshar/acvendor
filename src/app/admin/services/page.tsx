"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServicesAdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new unified services manager
        router.push('/admin/services/manager');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to Services Manager...</p>
            </div>
        </div>
    );
}
