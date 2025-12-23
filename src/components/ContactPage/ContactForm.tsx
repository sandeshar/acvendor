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
        <div id="contact-form" className="w-full rounded-xl border border-muted bg-card p-8 shadow-lg">
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
