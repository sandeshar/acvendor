"use client";
import CTAButton from '../shared/CTAButton';
import { useCallback } from 'react';

interface ContactHeroProps {
    data: {
        tagline: string;
        title: string;
        description: string;
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

    return (
        <div className="flex flex-col items-center text-center">
            {data.tagline && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary-var">
                    {data.tagline}
                </p>
            )}
            <h1 className="mb-4 text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] text-body">
                {data.title || 'Contact Our Team'}
            </h1>
            <p className="mb-8 max-w-3xl mx-auto text-lg md:text-xl text-subtext">
                {data.description || "Have a project in mind or just want to say hello? We'd love to connect. Reach out and let's create something amazing together."}
            </p>
            <CTAButton text="Start a Project With Us" className="px-6 mx-auto shadow-none hover:shadow-none" onClick={scrollToForm} />
        </div>
    );
};

export default ContactHero;
