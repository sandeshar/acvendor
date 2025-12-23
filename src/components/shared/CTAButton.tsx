"use client";
import React from 'react';
import Link from 'next/link';

interface CTAButtonProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    href?: string; // optional link (internal or external)
}

const CTAButton: React.FC<CTAButtonProps> = ({
    text,
    variant = 'primary',
    className = "",
    onClick,
    type = 'button',
    disabled = false,
    href,
}) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] transition-colors";

    const variantClasses: Record<string, string> = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30",
        secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white"
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className} disabled:opacity-60 disabled:cursor-not-allowed`;

    // If an href is provided, render an anchor (internal links use Next's Link for client nav)
    if (href) {
        const isExternal = /^https?:\/\//i.test(href);
        if (isExternal) {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick} aria-label={text}>
                    <span className="truncate">{text}</span>
                </a>
            );
        }

        return (
            <Link href={href} className={classes} onClick={onClick} aria-label={text}>
                <span className="truncate">{text}</span>
            </Link>
        );
    }

    // Default: regular button (for form submits or onClick handlers)
    return (
        <button
            type={type}
            disabled={disabled}
            className={classes}
            onClick={onClick}
        >
            <span className="truncate">{text}</span>
        </button>
    );
};

export default CTAButton;
