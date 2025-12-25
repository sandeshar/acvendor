import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getProducts(limit = 12) {
    try {
        const res = await fetch(`${API_BASE}/api/services?limit=${limit}`, { next: { tags: ['services'] } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Error fetching products:', (e as Error)?.message || String(e));
        return [];
    }
}

export default async function ProductsPage() {
    const products = await getProducts(12);

    return (
        <div className="layout-container flex flex-col md:flex-row grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 gap-6">
            <aside className="hidden md:flex flex-col w-64 shrink-0 gap-6">
                <div className="sticky top-24 bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col pb-2 border-b border-[#f0f2f4]">
                            <h1 className="text-[#111418] text-lg font-bold leading-normal">Categories</h1>
                            <p className="text-[#617589] text-xs font-normal leading-normal">Browse by AC Type</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary" href="#">
                                <span className="material-symbols-outlined">ac_unit</span>
                                <p className="text-sm font-bold leading-normal">All Products</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">mode_off_on</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Wall Mounted (Inverter)</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">mode_fan</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Wall Mounted (Non-Inv)</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">grid_view</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Ceiling Cassette AC</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">vertical_split</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Floor Standing AC</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">luggage</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Portable AC</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">water_drop</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">De-Humidifier</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">swap_vert</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Ceiling Floor Conv.</p>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f0f2f4] group transition-colors" href="#">
                                <span className="material-symbols-outlined text-[#617589] group-hover:text-[#111418]">air</span>
                                <p className="text-[#111418] text-sm font-medium leading-normal">Ductable AC</p>
                            </a>
                        </div>
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
                    <div className="flex min-h-[280px] sm:min-h-[320px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 py-8 sm:px-10" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2Tz9Tfqhk4mbHJCHiu0oDVp0NoXhq3FZ4FWT4t4oDgBFElAQqkLaNHkgOgYoVOjKiBbaVk4_2Z46NME9AfESb3afunhjert5tbwt2krROCRsTP9Ssqtqrki6QQeOl7CUyVEehH4okoN8LNauFDea_eB75lRLxkyNTB6XkInLUTMDAFO4f3S2vYllrBQ7AQveBrZbVOdB_7IP7nyivJ35_FSeVmR1Wr-oP_OHeGZUqfpGdK6-WYiXL_W139SClaNhVh78ewkn9X9k")' }}>
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
                    <div className="flex gap-3 w-max">
                        <button className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-[#111418] px-4 transition-colors">
                            <span className="text-white text-sm font-medium whitespace-nowrap">All</span>
                        </button>
                        <button className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 px-4 whitespace-nowrap">
                            <span className="text-[#111418] text-sm font-medium">Wall Inverter</span>
                        </button>
                        <button className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 px-4 whitespace-nowrap">
                            <span className="text-[#111418] text-sm font-medium">Non-Inverter</span>
                        </button>
                        <button className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 px-4 whitespace-nowrap">
                            <span className="text-[#111418] text-sm font-medium">Cassette</span>
                        </button>
                        <button className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-white border border-gray-200 px-4 whitespace-nowrap">
                            <span className="text-[#111418] text-sm font-medium">Floor Standing</span>
                        </button>
                    </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p: any) => (
                        <div key={p.id} className="group flex flex-col bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                            <div className="relative h-48 w-full bg-[#f3f6f9] flex items-center justify-center p-4">
                                {p.inventory_status === 'in_stock' && <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">IN STOCK</div>}
                                <img alt={p.title || p.slug} className="h-full w-auto object-contain mix-blend-multiply" src={p.thumbnail || '/placeholder-product.png'} />
                                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                                </button>
                            </div>
                            <div className="p-4 flex flex-col flex-1 gap-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded">{p.category || 'Wall Mounted'}</span>
                                    <span className="text-xs font-medium text-gray-500">{p.subcategory || ''}</span>
                                </div>
                                <Link href={`/products/${p.slug}`} className="text-lg font-bold text-[#111418] group-hover:text-primary transition-colors">{p.title}</Link>
                                <p className="text-sm text-[#617589] line-clamp-2">{p.excerpt || p.description || ''}</p>
                                <div className="flex gap-2 flex-wrap my-2">
                                    <div className="flex items-center gap-1 bg-[#f0f2f4] px-2 py-1 rounded text-xs font-medium text-gray-700">
                                        <span className="material-symbols-outlined text-[14px]">ac_unit</span> {p.capacity || '1.0 Ton'}
                                    </div>
                                    {p.efficiency && <div className="flex items-center gap-1 bg-[#f0f2f4] px-2 py-1 rounded text-xs font-medium text-gray-700">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span> {p.efficiency}
                                    </div>}
                                </div>
                                <div className="mt-auto pt-3 border-t border-[#f0f2f4] flex gap-2">
                                    <Link href={`/products/${p.slug}`} className="flex-1 h-9 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors flex items-center justify-center">View Details</Link>
                                    <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#e5e7eb] text-[#111418] hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-8">
                    <nav aria-label="Pagination" className="flex items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">3</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-gray-50 text-[#111418]">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </nav>
                </div>

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
