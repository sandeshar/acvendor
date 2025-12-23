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
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full max-w-7xl py-5">
                <section className="w-full py-20 sm:py-32">
                    <div className="text-center">
                        {hero ? (
                            <ContactHero data={hero} />
                        ) : (
                            <div className="mx-auto max-w-2xl animate-pulse space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                                <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                            </div>
                        )}
                    </div>
                </section>

                <section className="py-16 sm:py-24">
                    <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
                        {info ? (
                            <ContactInfo data={info} />
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        )}
                        {formConfig ? (
                            <ContactForm data={formConfig} />
                        ) : (
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
                </section>

                <section className="py-16 sm:py-24">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                        <div className="overflow-hidden rounded-lg">
                            <iframe
                                src={mapUrl}
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Maps Location"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
