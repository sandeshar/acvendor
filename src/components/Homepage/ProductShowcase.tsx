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

    return (
        <section className="w-full layout-container px-4 md:px-10 py-20 sm:py-32">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-3xl md:text-4xl font-bold">{titleText}</h3>
                    <Link href={viewAllLink} className="text-sm text-primary-var font-medium">View all products</Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((p, i) => (
                        <div key={p._id ?? p.id ?? p.slug ?? i} className="bg-card rounded-lg overflow-hidden border border-solid border-muted shadow-sm">
                            <Link href={`${productBaseLink}/${p.slug}`} className="block">
                                <div className="h-48 w-full bg-gray-100 bg-center bg-cover" style={{ backgroundImage: `url(${p.thumbnail || '/placeholder-400x300.png'})` }} role="img" aria-label={p.title}></div>
                                <div className="p-4">
                                    <h4 className="text-sm font-semibold text-body mb-1 truncate">{p.title}</h4>
                                    <div className="text-sm text-subtext mb-3">{p.excerpt}</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-base font-bold">{p.price ? `NPR ${formatPrice(p.price)}` : ''}</div>
                                        <div className="text-right">
                                            <span className="text-xs text-subtext">Starting at</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductShowcase;