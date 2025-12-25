"use client";
import CTAButton from '../shared/CTAButton';
import { useCallback } from 'react';

interface ContactHeroProps {
    data: {
        tagline?: string;
        title?: string;
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

    const bgUrl = data?.background_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3sUyzaPZwV1NkXFy1RVfXig-8QL1pRq8xcte2OwUjQYFPkAYkgerYdWGsF4vonxz-w4k-gHtnCFQcPZySc8WAnuxGKnbYar9JczXvDWr00I7lvY3eNwf9zsNE6F4mCnVlljvEjYKq6HyhI2d5KKFtL7BhatjnnPl5wBPtwp3CMtPNDt8SkP371j6g7JNVyTeJCAQSoFeqx9NXiIkvwZJtpbHBEjPD3OsstMyXFYgbIxrNyn01QI0UyzQIqsdalxCAX2Ae8qY4bOU';

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center bg-cover bg-center" data-alt={data.title || 'Modern air conditioner blowing cool air in a living room'} style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("${bgUrl}")` }}>
            <div className="text-center px-4 max-w-4xl">
                <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-4">
                    {data.title || 'Get in Touch'}
                </h1>
                <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                    {data.description || 'Expert cooling solutions for your home and business. We are here to help you stay cool all year round.'}
                </p>
            </div>
        </div>
    );
};

export default ContactHero;
