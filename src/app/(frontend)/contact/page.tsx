import ContactHero from "@/components/ContactPage/ContactHero";
import ContactInfo from "@/components/ContactPage/ContactInfo";
import ContactForm from "@/components/ContactPage/ContactForm";

import type { ContactHeroData, ContactInfoData, ContactFormConfigData } from "@/types/pages";

async function getContactData() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const [heroRes, infoRes, formConfigRes] = await Promise.all([
            fetch(`${baseUrl}/api/pages/contact/hero`, { next: { tags: ['contact-hero'] } }),
            fetch(`${baseUrl}/api/pages/contact/info`, { next: { tags: ['contact-info'] } }),
            fetch(`${baseUrl}/api/pages/contact/form-config`, { next: { tags: ['contact-form-config'] } })
        ]);

        const heroData = await heroRes.json();
        const infoData = await infoRes.json();
        const formConfigData = await formConfigRes.json();

        return {
            hero: heroData,
            info: infoData,
            formConfig: formConfigData
        };
    } catch (error) {
        console.error('Error fetching contact page data:', error);
        return {
            hero: null,
            info: null,
            formConfig: null
        };
    }
}

export default async function ContactPage() {
    const data = await getContactData();

    const { hero, info, formConfig } = data;

    const mapUrl = info?.map_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.77259250663!2d85.33749181506213!3d27.6934339828003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1999f82d1c07%3A0x6b69b5033a763c6c!2sNew%20Baneshwor%2C%20Kathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sus!4v1678886450123!5m2!1sen!2sus';

    return (
        <main className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative w-full">
                {hero ? (
                    <ContactHero data={hero} />
                ) : (
                    <div className="relative w-full h-[300px] bg-gray-200 animate-pulse" />
                )}
            </div>

            {/* Content: Contact Info + Form */}
            <div className="layout-container flex flex-col items-center py-10 px-4 md:px-10 lg:px-40">
                <div className="layout-content-container flex flex-col lg:flex-row gap-12 w-full max-w-[1200px]">
                    <div className="flex flex-col flex-1">
                        {info ? <ContactInfo data={info} /> : (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col flex-1">
                        {formConfig ? <ContactForm data={formConfig} /> : (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                                <div className="space-y-3">
                                    <div className="h-10 bg-gray-200 rounded w-full" />
                                    <div className="h-10 bg-gray-200 rounded w-full" />
                                    <div className="h-20 bg-gray-200 rounded w-full" />
                                    <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="layout-container flex flex-col items-center pb-10 px-4 md:px-10 lg:px-40">
                <div className="layout-content-container flex flex-col w-full max-w-[1200px] gap-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
                        <h2 className="text-[#111418] text-2xl font-bold">Visit Our Showroom</h2>
                    </div>
                    <div className="w-full h-[400px] bg-gray-200 rounded-xl overflow-hidden shadow-sm relative">
                        {/* Placeholder for Map */}
                        <img alt="Map showing location in Kathmandu, Nepal" className="w-full h-full object-cover" data-location="Kathmandu, Nepal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOUKMvaWzb3aH0Bz1dqGgfyrM6NcctxxrLWWWvq8EugMzewfkjhFt5lEpDL3yHM7W9NElPJaqB-I-9naFiIXySy73RPWIHBSN0VRmXzq9eZVzlKuMkke9UW2yDh3s1snPnCOS0Lw_QffdMcEKsxl1Ewspic6TSUqiTZLQULC0t6n7WJteGzEXBqZs7AnoVJ0FxrF448txa2rlfVDx0CDBRs8kITNZ25mHhzgvFmQuGy6Lggc1p2_RUS33UocLMH6EuahJk7nEHvT4" />
                        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                            <p className="font-bold text-sm text-[#111418]">Nepal AC Co. Headquarters</p>
                            <p className="text-xs text-gray-500 mt-1">Get directions to our main office for product demos and consultations.</p>
                            <a className="text-primary text-xs font-bold mt-2 inline-block hover:underline" href="#">View on Google Maps</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ / Help Section (Optional) */}
            <div className="bg-[#f0f2f4] py-12 px-4">
                <div className="max-w-[960px] mx-auto text-center">
                    <h2 className="text-[#111418] text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h4 className="font-bold text-primary mb-2">Do you offer free site visits?</h4>
                            <p className="text-sm text-[#617589]">Yes, we provide free site inspections within Kathmandu valley for new installations.</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h4 className="font-bold text-primary mb-2">What is the warranty period?</h4>
                            <p className="text-sm text-[#617589]">Most of our AC units come with a 1-year product warranty and 5-year compressor warranty.</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h4 className="font-bold text-primary mb-2">Do you repair old ACs?</h4>
                            <p className="text-sm text-[#617589]">Yes, our certified team services and repairs all major brands of air conditioners.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
