"use client";

import { useState, useEffect, useRef } from 'react';
import CTAButton from './CTAButton';

interface ContactFormSectionProps {
    namePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder?: string;
    servicePlaceholder: string;
    messagePlaceholder: string;
    submitButtonText: string;
    successMessage?: string;
    className?: string;
    variant?: 'simple' | 'labeled'; // simple for homepage, labeled for contact page
}

const ContactFormSection = ({
    namePlaceholder,
    emailPlaceholder,
    phonePlaceholder,
    servicePlaceholder,
    messagePlaceholder,
    submitButtonText,
    successMessage = 'Thank you for contacting us! We will get back to you soon.',
    className = '',
    variant = 'simple'
}: ContactFormSectionProps) => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Services come from the CMS (DB) — fallback to internal list if fetch fails
    const [services, setServices] = useState<Array<{ slug: string; title: string }>>([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [serviceFilter, setServiceFilter] = useState('');

    // Fetch available services (client-side)
    useEffect(() => {
        let mounted = true;
        const loadServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (!res.ok) throw new Error('Failed to load services');
                const data = await res.json();
                if (!mounted) return;
                // Map to slug/title pairs (fallback in case shape varies)
                const mapped = data.map((s: any) => ({ slug: s.slug || s.key || String(s.id), title: s.title || s.meta_title || s.key || String(s.id) }));
                setServices(mapped);
            } catch (err) {
                // ignore — keep default options below
                setServices([]);
            } finally {
                if (mounted) setServicesLoading(false);
            }
        };
        loadServices();
        return () => { mounted = false; };
    }, []);

    // When services loaded check URL param to preselect and scroll to form if present
    useEffect(() => {
        if (servicesLoading) return;
        try {
            const params = new URLSearchParams(window.location.search);
            const svc = params.get('service');
            if (svc) {
                const found = services.find(s => s.slug === svc);
                if (found) {
                    setFormState(prev => ({ ...prev, service: svc }));
                }
                const el = document.getElementById('contact-form');
                if (el) {
                    setTimeout(() => {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        const input = el.querySelector('input, textarea, select') as HTMLElement | null;
                        if (input) input.focus();
                    }, 150);
                }
            }
        } catch (err) {
            // ignore
        }
    }, [servicesLoading, services]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus(null);
        setSubmitting(true);

        try {
            const res = await fetch('/api/pages/contact/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formState),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message');
            }

            setStatus({ type: 'success', message: successMessage });
            setFormState({ name: '', email: '', phone: '', service: '', message: '' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
            setStatus({ type: 'error', message });
        } finally {
            setSubmitting(false);
        }
    };

    if (variant === 'labeled') {
        return (
            <form className={`flex flex-col gap-6 ${className}`} onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <label className="flex flex-col">
                        <p className="pb-2 text-sm font-medium leading-normal text-[#111318]">Full Name</p>
                        <input
                            className="form-input flex h-12 w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-base font-normal leading-normal text-[#111318] placeholder:text-[#616f89] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                            placeholder={namePlaceholder}
                            type="text"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            required
                        />
                    </label>
                    <label className="flex flex-col">
                        <p className="pb-2 text-sm font-medium leading-normal text-[#111318]">Work Email</p>
                        <input
                            className="form-input flex h-12 w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-base font-normal leading-normal text-[#111318] placeholder:text-[#616f89] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                            placeholder={emailPlaceholder}
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            required
                        />
                    </label>
                </div>
                <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium leading-normal text-[#111318]">Phone Number</p>
                    <input
                        className="form-input flex h-12 w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-base font-normal leading-normal text-[#111318] placeholder:text-[#616f89] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                        placeholder={phonePlaceholder || 'Enter your phone number'}
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                </label>
                <label className="flex flex-col">
                    <div>
                        <p className="pb-2 text-sm font-medium leading-normal text-[#111318]">Service of Interest</p>
                    </div>

                    {/* Combobox / Dropdown */}
                    <ServiceDropdown
                        services={services}
                        loading={servicesLoading}
                        filter={serviceFilter}
                        onFilterChange={setServiceFilter}
                        value={formState.service}
                        onChange={(slug: string) => setFormState({ ...formState, service: slug })}
                        placeholder={servicePlaceholder || 'Select a service'}
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-sm font-medium leading-normal text-[#111318]">Your Message</p>
                    <textarea
                        className="form-textarea flex min-h-36 w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-base font-normal leading-normal text-[#111318] placeholder:text-[#616f89] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/50"
                        placeholder={messagePlaceholder}
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        required
                    />
                </label>

                <CTAButton
                    text={submitting ? 'Sending...' : submitButtonText}
                    variant="primary"
                    className="w-full shadow-none hover:shadow-none"
                    type="submit"
                    disabled={submitting}
                />

                {status && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm ${status.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                            }`}
                    >
                        {status.message}
                    </div>
                )}
            </form>
        );
    }

    return (
        <form className={`flex flex-col gap-4 ${className}`} onSubmit={handleSubmit}>
            <input
                className="w-full h-12 px-4 rounded-lg bg-background-light border border-slate-300 focus:ring-primary focus:border-primary"
                placeholder={namePlaceholder}
                type="text"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
            />
            <input
                className="w-full h-12 px-4 rounded-lg bg-background-light border border-slate-300 focus:ring-primary focus:border-primary"
                placeholder={emailPlaceholder}
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                required
            />
            <input
                className="w-full h-12 px-4 rounded-lg bg-background-light border border-slate-300 focus:ring-primary focus:border-primary"
                placeholder={phonePlaceholder || 'Phone Number'}
                type="tel"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
            />
            <ServiceDropdown
                services={services}
                loading={servicesLoading}
                filter={serviceFilter}
                onFilterChange={setServiceFilter}
                value={formState.service}
                onChange={(slug: string) => setFormState({ ...formState, service: slug })}
                placeholder={servicePlaceholder || 'Select a service'}
            />
            <textarea
                className="w-full px-4 py-3 rounded-lg bg-background-light border border-slate-300 focus:ring-primary focus:border-primary"
                placeholder={messagePlaceholder}
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                required
            />
            <CTAButton
                text={submitting ? 'Sending...' : submitButtonText}
                variant="primary"
                className="w-full shadow-none hover:shadow-none"
                type="submit"
                disabled={submitting}
            />
            {status && (
                <div
                    className={`rounded-lg px-4 py-3 text-sm ${status.type === 'success'
                        ? 'border border-green-200 bg-green-50 text-green-800'
                        : 'border border-red-200 bg-red-50 text-red-800'
                        }`}
                >
                    {status.message}
                </div>
            )}
        </form>
    );
};


// --- Small combobox component used for both variants ---
function ServiceDropdown({ services, loading, filter, onFilterChange, value, onChange, placeholder }:
    { services: Array<{ slug: string; title: string }>, loading: boolean, filter: string, onFilterChange: (v: string) => void, value: string, onChange: (v: string) => void, placeholder: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const selected = services.find(s => s.slug === value);
    const filtered = filter ? services.filter(s => s.title.toLowerCase().includes(filter.toLowerCase()) || s.slug.toLowerCase().includes(filter.toLowerCase())) : services;

    return (
        <div ref={ref} className="relative">
            <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)} className={`w-full h-12 px-3 rounded-lg border ${open ? 'border-primary' : 'border-gray-300'} bg-white text-left flex items-center justify-between`}>
                <span className={`${selected ? 'text-body' : 'text-muted'}`}>{selected ? selected.title : placeholder}</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            <div className={`absolute z-50 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border ${open ? 'block' : 'hidden'}`}>
                <div className="p-2">
                    <input type="search" placeholder={loading ? 'Loading services...' : 'Search services...'} value={filter} onChange={(e) => { onFilterChange(e.target.value); }} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="max-h-56 overflow-auto">
                    {loading ? (
                        <div className="p-3 text-sm text-gray-500">Loading services...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No services found</div>
                    ) : (
                        filtered.map(s => (
                            <button key={s.slug} type="button" onClick={() => { onChange(s.slug); setOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50">{s.title}</button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ContactFormSection;
