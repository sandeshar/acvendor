import { NextResponse } from 'next/server';
import { connectDB } from '@/db';
import {
    ContactPageHero,
    ContactPageInfo,
    ContactPageFormConfig
} from '@/db/contactPageSchema';

export async function POST() {
    try {
        await connectDB();

        // Clear existing data
        await ContactPageHero.deleteMany({});
        await ContactPageInfo.deleteMany({});
        await ContactPageFormConfig.deleteMany({});

        // Seed Hero Section
        await ContactPageHero.create({
            badge_text: 'Contact us',
            tagline: 'CONTACT US',
            title: "Let's Start a Conversation",
            description: "We're here to help you with your cooling needs. Reach out to us, and we'll get back to you as soon as possible.",
            background_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80',
            hero_image_alt: 'Contact our support team',
            is_active: 1,
        });

        // Seed Contact Info
        await ContactPageInfo.create({
            office_location: 'Kathmandu, Nepal',
            phone: '+977 9800000000',
            // Required phone fields
            phone_item_1_number: '+977 9800000000',
            phone_item_2_number: '+977 9800000001',
            email: 'support@acvendor.com',
            // WhatsApp fields
            whatsapp_number: '+977 9800000000',
            whatsapp_link: 'https://wa.me/9779800000000',
            map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5769816700773!2d85.3206!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQzJzAyLjAiTiA4NcKwMTknMjIuMiJF!5e0!3m2!1sen!2snp!4v',
            info_title: 'Contact Information',
            info_description: "Reaching out for a repair, new installation, or general inquiry? We're just a call away.",
            map_description: 'Get directions to our main office for product demos and consultations.',
            phone_item_1_subtext: 'Sales Hotline (24/7)',
            phone_item_2_subtext: 'Service Support & Repairs',
            whatsapp_title: 'Chat on WhatsApp',
            whatsapp_subtext: 'Get instant quotes & support',
            location_title: 'Head Office',
            opening_hours_title: 'Opening Hours',
            opening_hours_text: 'Sun - Fri: 9:00 AM - 6:00 PM\nSaturday: Closed',
            is_active: 1,
        });

        // Seed Form Configuration
        await ContactPageFormConfig.create({
            name_placeholder: 'Your Name',
            email_placeholder: 'Your Email',
            phone_placeholder: 'Phone (optional)',
            subject_placeholder: 'Subject',
            service_placeholder: 'Select a service',
            message_placeholder: 'Your Message',
            submit_button_text: 'Send Message',
            success_message: 'Thank you for contacting us! We will get back to you soon.',
            is_active: 1,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Contact page seeded successfully with default values',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error seeding contact page:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed contact page',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
