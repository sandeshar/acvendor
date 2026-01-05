import Link from 'next/link';

interface Product {
    _id?: string;
    id?: number;
    slug: string;
    title: string;
    excerpt?: string;
    thumbnail?: string | null;
    price?: string | number | { $numberDecimal?: string } | null;
}

interface Props {
    products: Product[];
    brand?: string;
}

import { formatPrice } from '@/utils/formatPrice';


const ProductShowcase = ({ products, brand }: Props) => {
    if (!products || products.length === 0) return null;

    const brandLabel = brand ? `${brand.charAt(0).toUpperCase()}${brand.slice(1)}` : null;
    const titleText = brandLabel ? `Featured ${brandLabel} Products` : 'Featured Products';
    const viewAllLink = brand ? `/${brand}-ac` : '/midea-ac';
    const productBaseLink = brand ? `/${brand}-ac` : '/midea-ac';

    const defaultImages = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVILAJQ9DwHZBE1JIYDj4keWQtW_BU_zNsyM408VT-70r_05e9RILAOxe6_iWQfc4gjFhCsfJdN6HUcQI0MFZ9iomF0lQsEwM5FQOpFlfW0ermnU_iKa7bORM2A0yFLal1fljhvp7uY4ncg8H-27xtv-RDi4scBAeVl3ng5DKjBhVogN45uJKeD56-3aWLQKMqD0hYTg-kXF-TgiU0YXh-gXCrW4-GhRn7vlTrD6iIvOUtZILV3AE0UinHgUosqEWmyumUQpMUA5A",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCn297qlljlJLycQtF0RQGVkHNDq2JPpi_8wWXAZbFJr_8wdTsAeD8zhEZFbTSwIlO3tDq8BTRLS8pUa2_dOAuHU_yVB7U8W9j_pUD5NXKdjQtne43usqqSAeO1iOY3U8uj3rI0ItScXy3sLT3JgsnvBccGzkwpvJhuSTxBfGc4sYisprbvPsU7H5zA-6zSmG8EarGoYKD54MR_XY10PGc6fKx-ATpsHaM-joQgnkNhRfKwv2aJuq4UqQyR2o5S5EtTtV_4nxyhHjU",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUe7a_iUMPE2AU9e07GmcNveoIu6RM-sVrGTYP6B8ruOpftLHmuJivri0Uo6JsH9a6NVG4S7R_yyQLaFBfg54pBSlBckNEd2mnMN25yYN85QeRfoUSkRaqyBMd7-xHjlKkCo_bO1xuqOcq6w0QirwjqZx_-u1ZMK1jwimTlbGP5xQpxEYVgTZlUb8OByU6ZFev62lsDUGBG6CGMypTomeyvmVBbWqbpDw6cu9RtMPChkvAk5rCtDkUS7xP29sLVvJGF5PMi8fQoHk",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC2zt5WqHwVhciAWgZ5B184zF5ct2Nfdn46idFHb6ddfSv11zbHAso6tszdQ-Wpc822oId3vzM0sUXAQDKqLvWVpLfEOgowKNImMM3eyTmA24KFxS1VOHPPQu52YQdJu6ePfO30VR6EL5uOIJy4dQE1AIGj3FkAvTp0kmrMvgdzC0UCk74KF3TspahZWoifIlR66bFIzhJnGJPXYXGz9rq-hKOoqdNF9dlD_qzlj4rUILGklnHN3YeQeYMssnVO3FTaDj5tkphSjh8"
    ];

    return (
        <div className="w-full bg-white py-20" id="products">
            <div className="layout-container flex justify-center px-4 md:px-10">
                <div className="flex flex-col w-full max-w-[1280px] gap-12">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-[#111418] text-3xl md:text-4xl font-black leading-tight">
                                {titleText}
                            </h2>
                            <p className="text-[#617589] text-lg">
                                We supply a wide range of energy-efficient air conditioners.
                            </p>
                        </div>
                        <Link href={viewAllLink} className="text-primary font-bold hover:underline flex items-center">
                            View All Products <span className="material-symbols-outlined ml-1">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p, i) => (
                            <Link
                                key={p._id ?? p.id ?? p.slug ?? i}
                                href={`${productBaseLink}/${p.slug}`}
                                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div
                                    className="aspect-[4/3] w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${p.thumbnail || defaultImages[i % defaultImages.length]})` }}
                                    role="img"
                                    aria-label={p.title}
                                ></div>
                                <div className="p-4 flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-[#111418] truncate">{p.title}</h3>
                                    <p className="text-sm text-[#617589] line-clamp-2">{p.excerpt}</p>
                                    {p.price && (
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-primary font-bold">NPR {formatPrice(p.price)}</div>
                                            <div className="text-xs text-gray-400">Starting at</div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductShowcase;