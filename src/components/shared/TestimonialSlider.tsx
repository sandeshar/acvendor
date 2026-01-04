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
    filter?: string; // 'homepage', 'about', or service ID
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
    title = "Don't Just Take Our Word For It",
    subtitle = "We've helped businesses of all sizes achieve their content marketing goals. Here's what they have to say about our work.",
    filter = 'homepage',
}) => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, [filter]);

    const fetchTestimonials = async () => {
        try {
            let url = '/api/testimonial';

            // Check if filter is a service ID (numeric)
            if (!isNaN(Number(filter)) && Number(filter) > 0) {
                url += `?service=${filter}`;
            } else {
                // It's a page filter like 'homepage' or 'about'
                url += `?homepage=false&limit=10`;
            }

            const response = await fetch(url);
            const text = await response.text();

            if (!response.ok) {
                console.error('Error fetching testimonials: HTTP', response.status, text);
                setTestimonials([]);
                return;
            }

            let data: any;
            try {
                data = text ? JSON.parse(text) : [];
            } catch (err) {
                console.error('Invalid JSON from testimonials endpoint:', { url, status: response.status, text });
                setTestimonials([]);
                return;
            }

            // Ensure data is an array for downstream code
            if (!Array.isArray(data)) data = data ? [data] : [];

            // Filter by link/placement if it's not a service filter
            let filtered = data;
            if (isNaN(Number(filter))) {
                filtered = data.filter((t: Testimonial & { link?: string }) =>
                    t.link?.split(',').map(l => l.trim()).includes(filter)
                );
            }

            setTestimonials(filtered);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="px-4 md:px-10 py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return null;
    }

    // Duplicate testimonials multiple times for infinite loop effect
    // Repeat 4 times to ensure smooth scrolling even with few testimonials
    const duplicatedTestimonials = [
        ...testimonials,
        ...testimonials,
        ...testimonials,
        ...testimonials
    ];

    return (
        <section className="px-4 md:px-10 py-20 sm:py-32 overflow-hidden">
            <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 text-center items-center">
                    <h2 className="text-slate-900 text-3xl font-bold tracking-tight md:text-4xl md:font-black max-w-2xl">
                        {title}
                    </h2>
                    <p className="text-slate-600 text-lg font-normal leading-relaxed max-w-3xl">
                        {subtitle}
                    </p>
                </div>

                <div className="relative ">
                    <div className="flex gap-8 animate-scroll">
                        {duplicatedTestimonials.map((testimonial, index) => (
                            <div
                                key={`${testimonial.id}-${index}`}
                                className="shrink-0 w-[90vw] md:w-[45vw] lg:w-[30vw] flex flex-col justify-between gap-6 p-6 rounded-xl bg-white border border-slate-200"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-0.5 text-yellow-500">
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const r = Math.max(0, Math.min(5, Number(testimonial.rating) || 0));
                                            return (
                                                <svg
                                                    key={idx}
                                                    className={`h-5 w-5 ${idx < r ? 'text-yellow-400' : 'text-slate-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.455a1 1 0 00-.364 1.118l1.287 3.973c.3.922-.755 1.688-1.54 1.118l-3.39-2.454a1 1 0 00-1.175 0l-3.39 2.454c-.784.57-1.838-.196-1.539-1.118l1.286-3.973a1 1 0 00-.364-1.118L2.23 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                                                </svg>
                                            );
                                        })}
                                    </div>
                                    <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <img
                                        alt={testimonial.name}
                                        className="h-10 w-10 rounded-full object-cover grayscale"
                                        src={testimonial.url}
                                    />
                                    <div>
                                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-25%);
                    }
                }

                .animate-scroll {
                    animation: scroll 15s linear infinite;
                }

                .animate-scroll:hover {
                    animation-play-state: paused;
                }

                .mask-gradient {
                    position: relative;
                }

                .mask-gradient::before,
                .mask-gradient::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 150px;
                    z-index: 10;
                    pointer-events: none;
                }

                /* Use theme-aware background variable so the gradient doesn't look like a harsh white 'blur' on non-default themes */
                .mask-gradient::before {
                    left: 0;
                    background: linear-gradient(to right, var(--color-background), transparent);
                }

                .mask-gradient::after {
                    right: 0;
                    background: linear-gradient(to left, var(--color-background), transparent);
                }

                /* On small screens remove the edge mask so it doesn't create a "blur" fade into the cards */
                @media (max-width: 640px) {
                    .mask-gradient::before,
                    .mask-gradient::after {
                        display: none;
                        width: 0;
                    }
                }
            `}</style>
        </section>
    );
};

export default TestimonialSlider;
