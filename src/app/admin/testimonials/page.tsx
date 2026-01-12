'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    url: string;
    rating: number;
    link: string;
    service: number;
    date: string;
    serviceIds?: number[];
    productIds?: number[];
}

interface Service {
    id: number;
    title: string;
    slug: string;
}

function ViewModal({ testimonial, onClose, serviceMap, productMap }: { testimonial: Testimonial | null; onClose: () => void; serviceMap: Record<number, Service>; productMap: Record<number, Service>; }) {
    if (!testimonial) return null;

    const placements = (testimonial.link || '')
        .split(',')
        .map((loc) => loc.trim())
        .filter(Boolean);

    const renderStars = (rating: number) => {
        const r = Math.max(0, Math.min(5, Number(rating) || 0));
        const filledStars = Array.from({ length: r }).map((_, index) => (
            <span
                key={`filled-${index}`}
                className="material-symbols text-2xl text-yellow-400"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
                star
            </span>
        ));

        const emptyStars = Array.from({ length: 5 - r }).map((_, index) => (
            <span
                key={`empty-${index}`}
                className="material-symbols text-2xl text-gray-300"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
            >
                star
            </span>
        ));

        return [...filledStars, ...emptyStars];
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-2xl font-bold text-gray-900">Testimonial Details</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Author Info */}
                    <div className="mb-6 flex items-center gap-4 rounded-xl bg-linear-to-r from-primary-50 to-primary-50 p-4">
                        <img
                            src={testimonial.url}
                            alt={testimonial.name}
                            className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                        />
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{testimonial.name}</h3>
                            <p className="text-base text-gray-600">{testimonial.role}</p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">Rating</div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {renderStars(testimonial.rating)}
                            </div>
                            <span className="ml-2 text-lg font-bold text-gray-900">
                                {testimonial.rating}.0 / 5.0
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Content</h4>
                        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
                            {testimonial.content}
                        </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Placement
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {placements.map((loc) => (
                                    <span
                                        key={loc}
                                        className="inline-block rounded-full bg-linear-to-r from-primary to-primary px-3 py-1 text-xs font-medium text-white shadow-md"
                                    >
                                        {loc}
                                    </span>
                                ))}
                                {testimonial.serviceIds?.map((svcId) => {
                                    const svc = serviceMap[svcId];
                                    return (
                                        <span
                                            key={`svc-${svcId}`}
                                            className="inline-block rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-medium text-white shadow-md"
                                        >
                                            {svc?.title || `Service #${svcId}`}
                                        </span>
                                    );
                                })}
                                {testimonial.productIds?.map((pid) => {
                                    const prod = productMap[pid];
                                    return (
                                        <span
                                            key={`prod-${pid}`}
                                            className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-md"
                                        >
                                            {prod?.title || `Product #${pid}`}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                Date Added
                            </div>
                            <p className="text-base font-medium text-gray-900">
                                {new Date(testimonial.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TestimonialPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [products, setProducts] = useState<Service[]>([]);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const response = await fetch('/api/testimonial');
            const data = await response.json();
            setTestimonials(data);
            if (data.some((t: Testimonial) => t.serviceIds?.length)) {
                fetchServices();
            }
            if (data.some((t: Testimonial) => t.productIds?.length)) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete testimonial from "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/testimonial?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showToast('Testimonial deleted successfully!', { type: 'success' });
                fetchTestimonials();
            } else {
                const data = await response.json();
                showToast(data.error || 'Failed to delete testimonial', { type: 'error' });
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            showToast('Failed to delete testimonial. Please try again.', { type: 'error' });
        }
    };

    const filteredTestimonials = testimonials.filter((testimonial) =>
        testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testimonial.link.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const serviceMap = useMemo(() => {
        return services.reduce<Record<number, Service>>((acc, svc) => {
            acc[svc.id] = svc;
            return acc;
        }, {});
    }, [services]);

    const productMap = useMemo(() => {
        return products.reduce<Record<number, Service>>((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {});
    }, [products]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading testimonials...</div>
            </div>
        );
    }

    return (
        <div className="p-8 w-full">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Testimonials</h1>
                <Link
                    href="/admin/testimonials/new"
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                    Add New Testimonial
                </Link>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name, role, or link..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Placement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredTestimonials.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    No testimonials found.
                                </td>
                            </tr>
                        ) : (
                            filteredTestimonials.map((testimonial) => (
                                <tr
                                    key={testimonial.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={testimonial.url}
                                                alt={testimonial.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {testimonial.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {testimonial.role}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <div className="flex gap-1">
                                            {(() => {
                                                const r = Math.max(0, Math.min(5, Number(testimonial.rating) || 0));
                                                return (
                                                    <>
                                                        {Array.from({ length: r }).map((_, index) => (
                                                            <svg
                                                                key={index}
                                                                className={`h-5 w-5 ${index < r ? 'text-yellow-400' : 'text-slate-300'}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.455a1 1 0 00-.364 1.118l1.287 3.973c.3.922-.755 1.688-1.54 1.118l-3.39-2.454a1 1 0 00-1.175 0l-3.39 2.454c-.784.57-1.838-.196-1.539-1.118l1.286-3.973a1 1 0 00-.364-1.118L2.23 9.401c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                                                            </svg>
                                                        ))}
                                                        {Array.from({ length: 5 - r }).map((_, index) => (
                                                            <span
                                                                key={`empty-${index}`}
                                                                className="material-symbols text-sm text-gray-300"
                                                                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                                                            >
                                                                star
                                                            </span>
                                                        ))}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-2">
                                            {(testimonial.link || '')
                                                .split(',')
                                                .map((loc) => loc.trim())
                                                .filter(Boolean)
                                                .map((loc) => (
                                                    <span
                                                        key={loc}
                                                        className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800"
                                                    >
                                                        {loc}
                                                    </span>
                                                ))}
                                            {testimonial.serviceIds?.map((svcId) => {
                                                const svc = serviceMap[svcId];
                                                return (
                                                    <span
                                                        key={`svc-${svcId}`}
                                                        className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800"
                                                    >
                                                        {svc?.title || `Service #${svcId}`}
                                                    </span>
                                                );
                                            })}
                                            {testimonial.productIds?.map((pid) => {
                                                const prod = productMap[pid];
                                                return (
                                                    <span
                                                        key={`prod-${pid}`}
                                                        className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800"
                                                    >
                                                        {prod?.title || `Product #${pid}`}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {new Date(testimonial.date).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedTestimonial(testimonial)}
                                                className="text-gray-600 hover:text-gray-900"
                                                title="View"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                            <Link
                                                href={`/admin/testimonials/edit/${testimonial.id}`}
                                                className="text-primary hover:text-primary-900"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        testimonial.id,
                                                        testimonial.name
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ViewModal
                testimonial={selectedTestimonial}
                onClose={() => setSelectedTestimonial(null)}
                serviceMap={serviceMap}
                productMap={productMap}
            />
        </div>
    );
}
