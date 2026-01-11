import ContactFormSection from '../shared/ContactFormSection';

interface ContactSectionData {
    id: number;
    title: string;
    description: string;
    about_heading?: string;
    about_paragraph?: string; // rich HTML
    cta_text?: string;
    cta_link?: string;
    cta_style?: 'arrow' | 'underline';
    name_placeholder: string;
    email_placeholder: string;
    phone_placeholder?: string;
    service_placeholder: string;
    message_placeholder: string;
    submit_button_text: string;
    is_active: number;
    updatedAt: Date;
}

interface ContactProps {
    data?: ContactSectionData | null;
}

const Contact = ({ data }: ContactProps) => {
    if (!data) {
        return null;
    }

    return (
        <section className="px-4 md:px-10 py-20 sm:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white border border-gray-200 rounded-xl p-8 sm:p-12">
                <div>
                    {data.about_heading ? (
                        <h1 className="text-2xl md:text-3xl font-bold text-[#111418]">{data.about_heading}</h1>
                    ) : (
                        <h1 className="text-2xl md:text-3xl font-bold text-[#111418]">About Us</h1>
                    )}

                    {data.about_paragraph ? (
                        <div className="prose max-w-none text-[#617589] mt-3" dangerouslySetInnerHTML={{ __html: data.about_paragraph }} />
                    ) : (
                        <p className="text-[#617589] text-base mt-3">We are committed to providing top-notch air conditioning solutions tailored to your needs. Reach out to us for inquiries, support, or to schedule a service.</p>
                    )}

                    {data.cta_text ? (
                        data.cta_style === 'underline' ? (
                            <a href={data.cta_link || '/about'} className="mt-6 inline-block text-indigo-600 hover:text-indigo-700 font-semibold underline">
                                {data.cta_text}
                            </a>
                        ) : (
                            <a href={data.cta_link || '/about'} className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold">
                                <span>{data.cta_text}</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </a>
                        )
                    ) : null}
                </div>
                <div>
                <div className="flex flex-col gap-4 py-10">
                    <h2 className="text-2xl md:text-4xl font-black text-[#111418]">{data.title}</h2>
                    <p className="text-[#617589] text-base">{data.description}</p>
                </div>
                <ContactFormSection
                    namePlaceholder={data.name_placeholder}
                    emailPlaceholder={data.email_placeholder}
                    phonePlaceholder={data.phone_placeholder}
                    servicePlaceholder={data.service_placeholder}
                    messagePlaceholder={data.message_placeholder}
                    submitButtonText={data.submit_button_text}
                    variant="labeled"
                />
                </div>
            </div>
        </section>
    );
};

export default Contact;