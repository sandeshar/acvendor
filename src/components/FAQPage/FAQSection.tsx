'use client';

import React, { useState } from 'react';
import SearchBar from '../shared/SearchBar';

interface FAQCategory {
    id: number;
    name: string;
}

interface FAQItem {
    id: number;
    category_id: number;
    question: string;
    answer: string;
}

interface FAQSectionProps {
    categories: FAQCategory[];
    items: FAQItem[];
    searchPlaceholder: string;
}

const FAQSection = ({ categories, items, searchPlaceholder }: FAQSectionProps) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        categories.length > 0 ? categories[0].id : null
    );
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter((item) => {
        const matchesCategory = selectedCategoryId ? item.category_id === selectedCategoryId : true;
        const matchesSearch = searchTerm
            ? item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <div className="px-4 py-6 max-w-2xl mx-auto w-full">
                <SearchBar
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 p-3 flex-wrap mb-8">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 ${selectedCategoryId === category.id
                                ? 'bg-primary'
                                : 'bg-white hover:bg-slate-100 transition-colors shadow-sm'
                            }`}
                    >
                        <p
                            className={`text-sm font-medium leading-normal ${selectedCategoryId === category.id ? 'text-white' : 'text-slate-700'
                                }`}
                        >
                            {category.name}
                        </p>
                    </button>
                ))}
            </div>

            {/* FAQ Items */}
            <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
                {filteredItems.length > 0 ? (
                    filteredItems.map((faq, index) => (
                        <details
                            key={faq.id}
                            className="group rounded-xl bg-white p-6 shadow-sm border-l-4 border-transparent"
                            {...(index === 0 && !searchTerm ? { open: true } : {})}
                        >
                            <summary className="flex cursor-pointer items-center justify-between gap-6">
                                <h3 className="text-slate-800 text-lg font-semibold leading-normal">
                                    {faq.question}
                                </h3>
                                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <div className="absolute h-4 w-0.5 bg-primary transition-transform duration-300 group-open:rotate-90"></div>
                                    <div className="h-0.5 w-4 bg-primary"></div>
                                </div>
                            </summary>
                            <div className="overflow-hidden transition-all duration-500 ease-in-out">
                                <p className="text-slate-500 text-base font-normal leading-relaxed mt-4">
                                    {faq.answer}
                                </p>
                            </div>
                        </details>
                    ))
                ) : (
                    <p className="text-center text-slate-500">No FAQs found.</p>
                )}
            </div>
        </>
    );
};

export default FAQSection;
