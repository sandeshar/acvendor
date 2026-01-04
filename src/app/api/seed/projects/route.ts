import { connectDB } from '@/db';
import { Projects, ProjectsSection } from '@/db/projectsSchema';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await connectDB();

        // Seed Projects Section
        // Use a simple check to avoid duplicates if needed, but for seeding usually we just insert or update
        const existing = await ProjectsSection.findOne().lean();
        if (existing) {
            await ProjectsSection.findByIdAndUpdate(existing._id, {
                title: 'Our Engineering Excellence',
                description: 'Cooling Nepal, One Project at a Time. Explore our diverse portfolio of residential, commercial, and industrial HVAC installations across the country.',
                background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBttW6xBdRw1tfBXdAF9ibc5IrvpR0y-wCgzDU0_shUutz7Yikf6kgoSXoouAitl5HBEp3OgJBn6WXsBGHSVuwiQlIwZdGn3At4QAQ5ha0DBdG3q9cMa3oRgzqkjcEv9sVe6kXVRSKrJxyQvNYEWNMI87u4Iuy1p6PL2i-b7ZodX-ml0JLmRe_w2k_r-usH4auYcBJT5qv0XdukeBU7JHwJ3DaftaEs_VKbTN5O8RWEGTyPcuMTDfv43bUSGIGE8Y0Af0wfRug1jqc',
            });
        } else {
            await ProjectsSection.create({
                title: 'Our Engineering Excellence',
                description: 'Cooling Nepal, One Project at a Time. Explore our diverse portfolio of residential, commercial, and industrial HVAC installations across the country.',
                background_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBttW6xBdRw1tfBXdAF9ibc5IrvpR0y-wCgzDU0_shUutz7Yikf6kgoSXoouAitl5HBEp3OgJBn6WXsBGHSVuwiQlIwZdGn3At4QAQ5ha0DBdG3q9cMa3oRgzqkjcEv9sVe6kXVRSKrJxyQvNYEWNMI87u4Iuy1p6PL2i-b7ZodX-ml0JLmRe_w2k_r-usH4auYcBJT5qv0XdukeBU7JHwJ3DaftaEs_VKbTN5O8RWEGTyPcuMTDfv43bUSGIGE8Y0Af0wfRug1jqc',
                badge_text: 'Portfolio',
                cta_title: 'Ready to upgrade your climate control?',
                cta_description: 'From residential comfort to industrial precision, our engineers are ready to design the perfect solution for your needs.',
                cta_button_text: 'Contact Our Engineers',
                cta_button_link: '/contact',
                secondary_cta_text: 'Download Portfolio',
                secondary_cta_link: '#'
            });
        }

        // Seed Projects
        const projectData = [
            {
                title: 'Everest Hotel Renovation',
                category: 'Hospitality',
                location: 'Kathmandu',
                capacity: '450 Ton VRF',
                system: 'Daikin Inverter',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsYq056A0A6yztTI7rfkIH2hMstMLX9BaCNhLBX-gTHa-wV2o6xR1Nu47Sx5a9FC_bwUD933A5KIVFS452BxqMMBUa26Tv2LUOH0shamhL-nUqycrMXSIRkwjbzK0k5USw4oK7EULjhxgdr2yfp0dogPRfHERZTT31ZKC0QcE5LtEyePDZANqMeJ0a0ZcBUMJOAaHZ2dZ7mfl2ZYATrmhJveTlGo6qQ4QFWgoydQeeYGI_JOyY9w2HAyPzBkMpQZqrV_MpVgy1fRI',
                image_alt: 'Luxury hotel exterior in Kathmandu with modern glass facade',
                display_order: 1
            },
            {
                title: 'Bhat-Bhateni Supermarket',
                category: 'Commercial',
                location: 'Pokhara',
                capacity: '200 Ton Central',
                system: 'Blue Star Chillers',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdPRficiD8MvMhF2oWQLTgLDXqJTau1OlleaNE0RpF_NBX_JLfV32rN0Kt29z5EKv9neQ7oUa1UTdU9v6Vv9P7aUF3QQ_acn8BmX9_ZPj3p-bykWSLl775di6q9uwJd6AuZEguSOGLeyVZHDHr272jelMQyVdV8w7TF3IdCf8N3A_0UppuFmMVBasbvNjNYLRgN5mUkA954rZFdGLrziZd3oI9YPvbwusAHZuVWwQUgJK7JEutNb0jnJlK2XcItRnySWiFD8nBrUE',
                image_alt: 'Modern supermarket interior with visible ceiling ducts',
                display_order: 2
            },
            {
                title: 'Lalitpur Private Villa',
                category: 'Residential',
                location: 'Lalitpur',
                capacity: '5 Ton Multi-Split',
                system: 'Mitsubishi Electric',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkFOwzhuBqlHp3hT9suwjIDf0EMn2b6zJzXr7bq64j1sysj-u4aNqRqv2r9qCQLtq27ZYSHTI_GjwymiyBBeHuHJ57aHbDAz6WyCAPs-Gyrp66qxAedX2dcGr_tSwiQ3kx_5G0Ofp7zbnZEaSmlyNRuPADh7O5Ift08LDhSELVhh7cKyNyGkjTPnBuDCNjNLy5MP1oi0sJVLD7ZqebTIL7STKruO5Ez5NUp7NNs7gyG9eFqte5ONy4vA9Lrr8LhQnXw9E96VcpueI',
                image_alt: 'Luxurious private villa exterior with swimming pool',
                display_order: 3
            },
            {
                title: 'City Mall HVAC Upgrade',
                category: 'Commercial',
                location: 'Kathmandu',
                capacity: '300 Ton Chiller',
                system: 'Carrier Chillers',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBl6O38VvxyfX-OqogqUsHluE5Gf8QMkfI3L3TdnBjN4nj3o1CeYOGtsF5zz5lCJ-wIVkZGX_A1EvqvtY_raiTSBVwxS0iGW7pAA7tGhO1la-BSectzQeNIciqG-bSy--6sPdxgonnBze1G2nnohIphhjmdxE5B8Nvr1XzIvyU1VQLGIfRgFkA1RIt_57TcmnK6FX_OlyMlGlZFprtmwcU7w1_zKn-4lt76y37uinYtw8qZ9NCxLOF9XjwnVqUwnBtNPYUhwAn_qSU',
                image_alt: 'Modern shopping mall exterior with glass facade',
                display_order: 4
            },
            {
                title: 'Corporate Office Tower',
                category: 'Commercial',
                location: 'Biratnagar',
                capacity: '150 Ton VRF',
                system: 'Gree GMV5',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHtTpolztqbcKimnBisqy1tMhdQ-tXYiXLaikD_pWaS4GramA8HNxxNnJg6vwOwKdyzA9Pny2kttJYc0YajdXpcFP83YtkPIrkoImcLBSU1R9nRpDaL2x42-ffm_OjOqhrltDPjV35aBcBp26-SWeos68rghmN9tH58EPjehrQAfHLHBOytWoBYYP7zDn07ulHKUOxA1XJa3rxnZvyymcYCqhTMKRnS4cm9159FfoSqrepPZBv2x4tWIHloZUJ6AOa9sXENkf69ZI',
                image_alt: 'Tall corporate office tower against a blue sky',
                display_order: 5
            },
            {
                title: 'Pharma Warehouse',
                category: 'Industrial',
                location: 'Birgunj',
                capacity: 'Precision Cooling',
                system: 'Samsung DVM S',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9T4J-cWntg-xPE9JYIGt9YipJJ4Nluo6uu7xZk-nUiDPViQ6c4UcohIS8bU8xd-Pi3FxHWE0_hGIE8TufLYiZdeXwZgLAy-40le6qR5s-EnsGle7Cxwl42sCMPu7avoJ-t5PX5ivqv32JoaOAlUvm9jYdjaZNxrD1FeC_75gYLUyaOwbmLk7jX_NumkOPFNbAbTHOmv4UxCgc439hOXrrEjsk94FfzjD4r_KihDojE3BSuwkT8anMqg3tuHtGKHEysU0aVP9jNDc',
                image_alt: 'Industrial warehouse interior with large shelving units',
                display_order: 6
            }
        ];

        // For projects, we can safely just skip if they are already there or delete first
        // Simple approach: delete existing if any and re-insert
        await Projects.deleteMany({});

        for (const p of projectData) {
            await Projects.create(p);
        }

        return NextResponse.json({ success: true, message: 'Projects data seeded successfully' });
    } catch (error) {
        console.error('Error seeding projects:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function GET() {
    return POST();
}
