"use client";
import CTAButton from '../shared/CTAButton';
import { useCallback } from 'react';

interface ContactHeroProps {
    data: {
        badge_text?: string;
        tagline?: string;
        title?: string;
        highlight_text?: string;
        description?: string;
        background_image?: string;
        hero_image_alt?: string;
    };
}

const ContactHero = ({ data }: ContactHeroProps) => {
    const scrollToForm = useCallback(() => {
        try {
            const el = document.getElementById('contact-form');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Also focus the first input if available
                const input = el.querySelector('input, textarea, select') as HTMLElement | null;
                if (input) input.focus();
            } else {
                // Fallback: set hash so browser jumps if element later exists
                window.location.hash = '#contact-form';
            }
        } catch (err) {
            // ignore
        }
    }, []);

    const bgUrl = data?.background_image || '';

    const renderTitle = (title: string, highlight?: string) => {
        if (!highlight || !title.includes(highlight)) {
            return title;
        }

        const parts = title.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={i} className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center bg-cover bg-center" data-alt={data.hero_image_alt || ''} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("${bgUrl}")` }}>
            <div className="text-center px-4 max-w-4xl">
                {data.badge_text && (
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm text-white">
                        {data.badge_text}
                    </span>
                )}
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-4">
                    {renderTitle(data.title || '')}
                </h1>
                <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                    {data.description}
                </p>
            </div>
        </div>
    );
};

export default ContactHero;
