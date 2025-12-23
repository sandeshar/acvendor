import { Metadata } from "next";
import SeedRunner from "./SeedRunner";

export const metadata: Metadata = {
    title: "Admin | Seeder",
    robots: "noindex, nofollow",
};

const SeedPage = () => {
    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-background-light p-6">
            <div className="flex w-full max-w-3xl flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin only</p>
                    <h1 className="text-2xl font-bold text-slate-900">Seed panel</h1>
                    <p className="text-sm text-slate-600">Trigger `/api/seed/all` and review the results.</p>
                </div>
                <SeedRunner />
            </div>
        </div>
    );
};

export default SeedPage;
