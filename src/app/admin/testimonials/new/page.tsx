'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/shared/ImageUploader';
import { showToast } from '@/components/Toast';

interface Service {
    id: number;
    title: string;
    slug: string;
}

export default function AddTestimonialPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        content: '',
        rating: 5,
        service: 1,
        link: 'homepage',
    });
    const [displayLocations, setDisplayLocations] = useState<string[]>(['homepage']);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [includeInService, setIncludeInService] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);

    const [includeInProduct, setIncludeInProduct] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [products, setProducts] = useState<Service[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Service[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Service[]>([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    useEffect(() => {
        if (includeInService) {
            fetchServices();
        }
    }, [includeInService]);

    useEffect(() => {
        if (includeInProduct) {
            fetchProducts();
        }
    }, [includeInProduct]);

    useEffect(() => {
        if (includeInService && services.length > 0) {
            if (serviceSearch) {
                const filtered = services.filter(
                    (service) =>
                        service.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        service.slug.toLowerCase().includes(serviceSearch.toLowerCase())
                );
                setFilteredServices(filtered);
            } else {
                setFilteredServices(services);
            }
            setShowServiceDropdown(serviceSearch.trim().length > 0 && filteredServices.length > 0);
        } else {
            setFilteredServices([]);
            setShowServiceDropdown(false);
        }
    }, [serviceSearch, services, includeInService, filteredServices.length]);

    useEffect(() => {
        if (includeInProduct && products.length > 0) {
            if (productSearch) {
                const filtered = products.filter(
                    (product) =>
                        product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                        product.slug.toLowerCase().includes(productSearch.toLowerCase())
                );
                setFilteredProducts(filtered);
            } else {
                setFilteredProducts(products);
            }
            setShowProductDropdown(productSearch.trim().length > 0 && filteredProducts.length > 0);
        } else {
            setFilteredProducts([]);
            setShowProductDropdown(false);
        }
    }, [productSearch, products, includeInProduct, filteredProducts.length]);

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

    const handleServiceSelect = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.some((s) => s.id === service.id);
            if (exists) return prev;
            return [...prev, service];
        });
        setServiceSearch('');
        setShowServiceDropdown(false);
    };

    const handleProductSelect = (product: Service) => {
        setSelectedProducts((prev) => {
            const exists = prev.some((s) => s.id === product.id);
            if (exists) return prev;
            return [...prev, product];
        });
        setProductSearch('');
        setShowProductDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageUrl) {
            showToast('Please upload an image', { type: 'error' });
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/testimonial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    role: formData.role,
                    content: formData.content,
                    rating: formData.rating,
                    serviceIds: selectedServices.map((s) => s.id),
                    productIds: selectedProducts.map((p) => p.id),
                    link: displayLocations.join(','),
                    url: imageUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create testimonial');
            }

            showToast('Testimonial created successfully!', { type: 'success' });
            router.push('/admin/testimonials');
        } catch (error: any) {
            console.error('Error creating testimonial:', error);
            showToast(error.message || 'Failed to create testimonial. Please try again.', { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'rating' || name === 'service' ? parseInt(value) : value,
        }));
    };

    const handleLocationToggle = (location: string) => {
        setDisplayLocations((prev) => {
            if (prev.includes(location)) {
                // Remove if already selected, but keep at least one
                return prev.length > 1 ? prev.filter((l) => l !== location) : prev;
            } else {
                // Add if not selected
                return [...prev, location];
            }
        });
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add New Testimonial
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Create a new testimonial for your website
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-lg bg-white p-6 shadow"
                >
                    {/* Image Upload */}
                    <div className="mb-6">
                        <ImageUploader
                            label="Person Image"
                            value={imageUrl}
                            onChange={(url: string) => setImageUrl(url)}
                            folder="testimonials"
                            ratio="1:1"
                        />
                    </div>

                    {/* Name */}
                    <div className="mb-6">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Role */}
                    <div className="mb-6">
                        <label
                            htmlFor="role"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Role / Position *
                        </label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                            placeholder="CEO, Company Name"
                        />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <label
                            htmlFor="content"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Testimonial Content *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                            placeholder="Share your experience..."
                        />
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <label
                            htmlFor="rating"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Rating *
                        </label>
                        <select
                            id="rating"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                        >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={2}>2 Stars</option>
                            <option value={1}>1 Star</option>
                        </select>
                    </div>



                    {/* Display Locations */}
                    <div className="mb-6">
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Display Locations *
                        </label>
                        <div className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
                            {[
                                { value: 'homepage', label: 'Homepage' },
                                { value: 'about', label: 'About Page' },
                            ].map((location) => (
                                <label key={location.value} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={displayLocations.includes(location.value)}
                                        onChange={() => handleLocationToggle(location.value)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700">{location.label}</span>
                                </label>
                            ))}
                            <label className="flex items-center gap-3 cursor-pointer border-t border-gray-300 pt-3">
                                <input
                                    type="checkbox"
                                    checked={includeInService}
                                    onChange={(e) => {
                                        setIncludeInService(e.target.checked);
                                        if (!e.target.checked) {
                                            setSelectedServices([]);
                                            setServiceSearch('');
                                            setFormData((prev) => ({ ...prev, service: 1 }));
                                        }
                                    }}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Services Page</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer border-t border-gray-300 pt-3">
                                <input
                                    type="checkbox"
                                    checked={includeInProduct}
                                    onChange={(e) => {
                                        setIncludeInProduct(e.target.checked);
                                        if (!e.target.checked) {
                                            setSelectedProducts([]);
                                            setProductSearch('');
                                        }
                                    }}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Products</span>
                            </label>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Select one or more pages where this testimonial should be displayed
                        </p>
                        {displayLocations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {displayLocations.map((loc) => (
                                    <span
                                        key={loc}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800"
                                    >
                                        {loc}
                                        <button
                                            type="button"
                                            onClick={() => handleLocationToggle(loc)}
                                            className="hover:text-primary-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Service Search */}
                    {includeInService && (
                        <div className="mb-6 relative">
                            <label
                                htmlFor="serviceSearch"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Search Service *
                            </label>
                            <input
                                type="text"
                                id="serviceSearch"
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                placeholder="Type to search or click to see all services..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                            />
                            {showServiceDropdown && filteredServices.length > 0 && (
                                <div className="absolute bottom-full z-20 mb-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                    {filteredServices.slice(0, 50).map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => handleServiceSelect(service)}
                                            className="w-full px-4 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                                        >
                                            <div className="font-medium text-gray-900">
                                                {service.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {service.slug}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedServices.length > 0 && (
                                <div className="mt-2 rounded-lg bg-primary-50 p-3 border border-primary-200">
                                    <div className="mb-2 text-sm font-semibold text-primary-900">Selected Services</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedServices.map((service) => (
                                            <span
                                                key={service.id}
                                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-800 shadow-sm border border-primary-200"
                                            >
                                                {service.title}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedServices((prev) => prev.filter((s) => s.id !== service.id))}
                                                    className="hover:text-primary-900"
                                                    aria-label={`Remove ${service.title}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product Search */}
                    {includeInProduct && (
                        <div className="mb-6 relative">
                            <label
                                htmlFor="productSearch"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Search Product *
                            </label>
                            <input
                                type="text"
                                id="productSearch"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Type to search or click to see all products..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                            />
                            {showProductDropdown && filteredProducts.length > 0 && (
                                <div className="absolute bottom-full z-20 mb-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                                    {filteredProducts.slice(0, 50).map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => handleProductSelect(product)}
                                            className="w-full px-4 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                                        >
                                            <div className="font-medium text-gray-900">
                                                {product.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {product.slug}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedProducts.length > 0 && (
                                <div className="mt-2 rounded-lg bg-primary-50 p-3 border border-primary-200">
                                    <div className="mb-2 text-sm font-semibold text-primary-900">Selected Products</div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProducts.map((product) => (
                                            <span
                                                key={product.id}
                                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-800 shadow-sm border border-primary-200"
                                            >
                                                {product.title}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProducts((prev) => prev.filter((s) => s.id !== product.id))}
                                                    className="hover:text-primary-900"
                                                    aria-label={`Remove ${product.title}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:bg-gray-400"
                        >
                            {isSaving ? 'Creating...' : 'Create Testimonial'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/testimonials')}
                            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
