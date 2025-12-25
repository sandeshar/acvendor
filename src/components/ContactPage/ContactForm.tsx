import ContactFormSection from '../shared/ContactFormSection';

interface ContactFormProps {
    data: {
        name_placeholder: string;
        email_placeholder: string;
        phone_placeholder?: string;
        subject_placeholder: string;
        service_placeholder?: string;
        message_placeholder: string;
        submit_button_text: string;
        success_message: string;
    };
}

const ContactForm = ({ data }: ContactFormProps) => {
    return (
        <div id="contact-form" className="bg-white rounded-2xl shadow-lg border border-[#f0f2f4] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">FAST RESPONSE</div>
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#111418] mb-2">Request a Quick Quote</h3>
                <p className="text-[#617589] text-sm">Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>
            <ContactFormSection
                namePlaceholder={data.name_placeholder}
                emailPlaceholder={data.email_placeholder}
                phonePlaceholder={data.phone_placeholder}
                servicePlaceholder={data.service_placeholder || data.subject_placeholder}
                messagePlaceholder={data.message_placeholder}
                submitButtonText={data.submit_button_text}
                successMessage={data.success_message}
                variant="labeled"
            />
        </div>
    );
};

export default ContactForm;
