import CTAButton from '@/components/shared/CTAButton';
import FAQSection from '@/components/FAQPage/FAQSection';
import Link from 'next/link';

import type { FAQHeaderData, FAQCategory, FAQItem, FAQCTAData } from '@/types/pages';

async function getFAQData() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const [headerRes, categoriesRes, itemsRes, ctaRes] = await Promise.all([
            fetch(`${baseUrl}/api/pages/faq/header`, { next: { tags: ['faq-header'] } }),
            fetch(`${baseUrl}/api/pages/faq/categories`, { next: { tags: ['faq-categories'] } }),
            fetch(`${baseUrl}/api/pages/faq/items`, { next: { tags: ['faq-items'] } }),
            fetch(`${baseUrl}/api/pages/faq/cta`, { next: { tags: ['faq-cta'] } })
        ]);

        const headerData = await headerRes.json();
        const categoriesData = await categoriesRes.json();
        const itemsData = await itemsRes.json();
        const ctaData = await ctaRes.json();

        return {
            header: headerData,
            categories: categoriesData,
            items: itemsData,
            cta: ctaData
        };
    } catch (error) {
        console.error('Error fetching FAQ page data:', error);
        return {
            header: null,
            categories: [],
            items: [],
            cta: null
        };
    }
}

export default async function FAQPage() {
    const data = await getFAQData();
    const { header, categories, items, cta } = data;

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full max-w-7xl py-5">
                <div className="flex flex-col items-center text-center gap-3 p-4 mb-8">
                    {header ? (
                        <>
                            <p className="text-slate-900 text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                                {header.title}
                            </p>
                            <p className="text-slate-500 text-lg font-normal leading-normal max-w-2xl">
                                {header.description}
                            </p>
                        </>
                    ) : (
                        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                        </div>
                    )}
                </div>

                {categories.length > 0 || items.length > 0 ? (
                    <FAQSection
                        categories={categories}
                        items={items}
                        searchPlaceholder={header?.search_placeholder || ''}
                    />
                ) : (
                    <div className="space-y-4 py-8">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                )}

                {/* CTA Section */}
                {cta ? (
                    <div className="bg-primary/10 rounded-xl my-10 p-8 sm:p-10 text-center flex flex-col items-center">
                        <h3 className="text-3xl font-bold text-slate-900 mb-3">
                            {cta.title}
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-md text-lg">
                            {cta.description}
                        </p>
                        <CTAButton text={cta.button_text} href={cta.button_link} />
                    </div>
                ) : (
                    <div className="bg-primary/10 rounded-xl my-10 p-8 sm:p-10 text-center flex flex-col items-center animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
                        <div className="h-10 bg-gray-200 rounded w-1/3" />
                    </div>
                )}
            </div>
        </main>
    );
}
