import React from 'react';
import InfoCard from './InfoCard';

interface ContactInfoProps {
    data: {
        office_location: string;
        phone: string;
        email: string;
    };
}

const ContactInfo = ({ data }: ContactInfoProps) => {
    const contactItems = [
        {
            icon: (
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
            ),
            title: 'Email',
            description: 'Our team is here to help.',
            value: data.email,
            href: `mailto:${data.email}`,
        },
        {
            icon: (
                <span className="material-symbols-outlined" aria-hidden="true">call</span>
            ),
            title: 'Phone',
            description: 'Mon-Fri from 9am to 5pm.',
            value: data.phone,
            href: `tel:${data.phone}`,
        },
        {
            icon: (
                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
            ),
            title: 'Office',
            description: 'Come say hello at our office.',
            value: data.office_location,
        },
    ];

    return (
        <div className="flex flex-col justify-center gap-6">
            <div className="mb-8 flex min-w-72 flex-col gap-4">
                <p className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-[#111318]">Get in Touch</p>
                <p className="text-lg font-normal leading-normal text-[#616f89]">
                    We&apos;d love to hear from you. Please fill out this form and we will get in touch with you shortly. For general inquiries, you can also reach out to us using the contact details below.
                </p>
            </div>
            <div className="space-y-6">
                {contactItems.map((item) => (
                    <InfoCard
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        value={item.value}
                        href={item.href}
                    />
                ))}
            </div>
        </div>
    );
};

export default ContactInfo;
