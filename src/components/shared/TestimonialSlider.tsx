'use client';

import React, { useEffect, useState } from 'react';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    url: string;
    rating: number;
    date: string;
    productIds?: number[];
}

interface TestimonialSliderProps {
    title?: string;
    subtitle?: string;
    filter?: string;
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
    title = "Don't Just Take Our Word For It",
    subtitle = "We've helped businesses of all sizes achieve their content marketing goals.",
    filter = 'homepage',
}) => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                let url = `/api/testimonial`;
                if (!isNaN(Number(filter)) && Number(filter) > 0) {
                    url += `?service=${filter}`;
                } else {
                    url += `?homepage=false&limit=10`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();

                let filtered = Array.isArray(data) ? data : [data];
                if (isNaN(Number(filter))) {
                    filtered = filtered.filter((t: any) =>
                        t.link?.split(',').map((l: string) => l.trim()).includes(filter)
                    );
                }
                setTestimonials(filtered);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, [filter]);

    if (loading) {
        return (
            <div className="py-20 flex justify-center gap-4 overflow-hidden opacity-50">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="shrink-0 w-[30vw] h-64 bg-slate-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (testimonials.length === 0) return null;

    // Duplicating for infinite effect
    const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="py-20 sm:py-32 overflow-hidden bg-slate-50/50">
            <div className="container mx-auto px-6 mb-16 text-center">
                <h2 className="text-slate-900 text-3xl font-extrabold tracking-tight md:text-5xl mb-4">
                    {title}
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                    {subtitle}
                </p>
            </div>

            {/* Added mask-gradient class here */}
            <div className="relative mask-gradient">
                <div className="flex gap-6 animate-scroll py-4">
                    {duplicatedTestimonials.map((testimonial, index) => (
                        <div
                            key={`${testimonial.id}-${index}`}
                            className="shrink-0 w-[85vw] md:w-[40vw] lg:w-[28vw] flex flex-col justify-between p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`h-4 w-4 ${i < testimonial.rating ? 'text-orange-400' : 'text-slate-200'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.455a1 1 0 00-.364 1.118l1.287 3.973c.3.922-.755 1.688-1.54 1.118l-3.39-2.454a1 1 0 00-1.175 0l-3.39 2.454c-.784.57-1.838-.196-1.539-1.118l1.286-3.973a1 1 0 00-.364-1.118L2.23 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                                        </svg>
                                    ))}
                                </div>

                                <blockquote className="text-slate-700 text-base md:text-lg italic leading-relaxed">
                                    "{testimonial.content}"
                                </blockquote>
                            </div>

                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-50">
                                <img
                                    alt={testimonial.name}
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    src={testimonial.url}
                                />
                                <div>
                                    <p className="font-bold text-slate-900 text-sm md:text-base">{testimonial.name}</p>
                                    <p className="text-xs md:text-sm text-slate-500 font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-scroll {
                    animation: scroll 110s linear infinite;
                    width: max-content;
                }

                .animate-scroll:hover {
                    animation-play-state: paused;
                }

                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .mask-gradient::before,
                .mask-gradient::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100px;
                    z-index: 2;
                    pointer-events: none;
                }

                .mask-gradient::before {
                    left: 0;
                    background: linear-gradient(to right, rgb(248 250 252), transparent);
                }

                .mask-gradient::after {
                    right: 0;
                    background: linear-gradient(to left, rgb(248 250 252), transparent);
                }

                @media (max-width: 640px) {
                    .mask-gradient::before, .mask-gradient::after { width: 40px; }
                }
            `}</style>
        </section>
    );
};

export default TestimonialSlider;