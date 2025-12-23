'use client';

import React from 'react';

interface TestimonialCardProps {
    name: string;
    role: string;
    content: string;
    image: string;
    rating: number;
    date?: string;
}

const TestimonialCard = ({
    name,
    role,
    content,
    image,
    rating,
    date,
}: TestimonialCardProps) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm ring-1 ring-muted transition-shadow hover:shadow-md">
            {/* Rating */}
            <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                    const r = Math.max(0, Math.min(5, Number(rating) || 0));
                    return (
                        <svg
                            key={index}
                            className={`h-5 w-5 ${index < r ? 'text-yellow-400' : 'text-slate-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.455a1 1 0 00-.364 1.118l1.287 3.973c.3.922-.755 1.688-1.54 1.118l-3.39-2.454a1 1 0 00-1.175 0l-3.39 2.454c-.784.57-1.838-.196-1.539-1.118l1.286-3.973a1 1 0 00-.364-1.118L2.23 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                        </svg>

                    )
                })}
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed text-subtext">{content}</p>

            {/* Author */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <img
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                    src={image}
                    alt={name}
                />
                <div>
                    <h4 className="text-sm font-bold text-body">{name}</h4>
                    <p className="text-xs text-subtext">{role}</p>
                    {date && (
                        <p className="text-xs text-subtext">
                            {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
