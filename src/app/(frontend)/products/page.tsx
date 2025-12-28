import Link from 'next/link';
import ProductsListClient from '@/components/products/ProductsListClientWrapper';
import CategoriesList from '@/components/products/CategoriesList';
import CategoriesPills from '@/components/products/CategoriesPills';
import ProductsPagination from '@/components/products/ProductsPagination';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getProducts(limit = 12, category?: string, subcategory?: string, page: number = 1) {
    try {
        const q = new URLSearchParams();
        if (limit) q.set('limit', String(limit));
        if (category) q.set('category', category);
        if (subcategory) q.set('subcategory', subcategory);
        const offset = (Math.max(1, page) - 1) * (limit || 12);
        if (offset) q.set('offset', String(offset));
        const res = await fetch(`${API_BASE}/api/products?${q.toString()}`, { cache: 'no-store', next: { tags: ['products'] } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Error fetching products:', (e as Error)?.message || String(e));
        return [];
    }
}

export default async function ProductsPage({ searchParams }: { searchParams?: { category?: string, subcategory?: string } }) {
    const category = searchParams?.category;
    const subcategory = searchParams?.subcategory;
    const page = searchParams?.page ? parseInt(String(searchParams.page)) || 1 : 1;
    console.log('ProductsPage: searchParams', { category, subcategory, page });
    const products = await getProducts(12, category, subcategory, page);

    const hasMore = (products || []).length === 12;

    const buildHref = (newPage: number) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (subcategory) params.set('subcategory', subcategory);
        if (newPage && newPage > 1) params.set('page', String(newPage));
        const qs = params.toString();
        return `/products${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="layout-container flex flex-col md:flex-row grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 gap-6">
            <aside className="hidden md:flex flex-col w-64 shrink-0 gap-6">
                <div className="sticky top-24 bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col pb-2 border-b border-[#f0f2f4]">
                            <h1 className="text-[#111418] text-lg font-bold leading-normal">Categories</h1>
                            <p className="text-[#617589] text-xs font-normal leading-normal">Browse by AC Type</p>
                        </div>
                        <CategoriesList selectedCategory={category ?? ''} selectedSubcategory={subcategory ?? ''} />
                    </div>
                    <div className="mt-6 pt-6 border-t border-[#f0f2f4]">
                        <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#111418] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                            <span className="truncate">Download Full Catalog</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex flex-col flex-1 gap-6 w-full min-w-0">
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link href="/" className="text-[#617589] font-medium leading-normal hover:text-primary transition-colors">Home</Link>
                    <span className="text-[#617589] font-medium leading-normal">/</span>
                    <span className="text-[#111418] font-medium leading-normal">Product Catalog</span>
                </div>

                <div className="relative w-full overflow-hidden rounded-xl">
                    <div className="flex min-h-[280px] sm:min-h-80 flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 py-8 sm:px-10" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2Tz9Tfqhk4mbHJCHiu0oDVp0NoXhq3FZ4FWT4t4oDgBFElAQqkLaNHkgOgYoVOjKiBbaVk4_2Z46NME9AfESb3afunhjert5tbwt2krROCRsTP9Ssqtqrki6QQeOl7CUyVEehH4okoN8LNauFDea_eB75lRLxkyNTB6XkInLUTMDAFO4f3S2vYllrBQ7AQveBrZbVOdB_7IP7nyivJ35_FSeVmR1Wr-oP_OHeGZUqfpGdK6-WYiXL_W139SClaNhVh78ewkn9X9k")' }}>
                        <div className="flex flex-col gap-2 text-left max-w-lg">
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">New Arrival</span>
                            <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Xtreme Save Series</h1>
                            <h2 className="text-gray-100 text-sm sm:text-base font-normal leading-relaxed">Stay cool while saving up to 60% energy with our new Inverter Technology designed for Nepal's voltage fluctuations.</h2>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors">Explore Series</button>
                        </div>
                    </div>
                </div>

                <div className="md:hidden overflow-x-auto pb-2 scrollbar-hide">
                    <CategoriesPills selectedCategory={category ?? ''} selectedSubcategory={subcategory ?? ''} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <h2 className="text-xl font-bold text-[#111418]">Featured Products</h2>
                    <div className="flex gap-2">
                        <select className="h-9 rounded-lg border-gray-200 text-sm bg-white text-[#111418] focus:ring-primary focus:border-primary">
                            <option>Sort by: Recommended</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Capacity: Low to High</option>
                        </select>
                    </div>
                </div>

                {/* Interactive client-side list with cleaner UI */}
                <ProductsListClient products={products} />

                {/* Client-driven pagination component ensures category/subcategory are preserved during navigation */}
                <ProductsPagination currentPage={page} hasMore={hasMore} />

                <div className="bg-primary/5 rounded-xl p-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/20">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-bold text-[#111418]">Need a custom cooling solution?</h3>
                        <p className="text-[#617589] text-base">Contact us for bulk orders, project installations, or specific requirement consultations.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white border border-gray-200 text-[#111418] text-base font-bold shadow-sm hover:shadow transition-shadow">Contact Sales</button>
                        <button className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold hover:bg-blue-600 transition-colors">Request Quote</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
