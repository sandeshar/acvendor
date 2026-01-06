import { connectDB, Projects, ProjectsSection } from '@/db';
import ProjectsClient from '@/components/projects/ProjectsClient';

export const dynamic = 'force-dynamic';

async function getProjectsData() {
    try {
        await connectDB();

        const [sectionData, allProjects] = await Promise.all([
            ProjectsSection.findOne().lean(),
            Projects.find({ is_active: true }).sort({ display_order: 1 }).lean()
        ]);

        return {
            section: sectionData ? JSON.parse(JSON.stringify(sectionData)) : null,
            projects: JSON.parse(JSON.stringify(allProjects))
        };
    } catch (error) {
        console.error('Error fetching projects data:', error);
        return { section: null, projects: [] };
    }
}

export default async function ProjectsPage() {
    const { section, projects: items } = await getProjectsData();

    // Mapping some data to defaults if missing
    const hero = {
        title: section?.title || 'Our Engineering Excellence',
        description: section?.description || 'Cooling Nepal, One Project at a Time. Explore our diverse portfolio of residential, commercial, and industrial HVAC installations across the country.',
        background_image: section?.background_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBttW6xBdRw1tfBXdAF9ibc5IrvpR0y-wCgzDU0_shUutz7Yikf6kgoSXoouAitl5HBEp3OgJBn6WXsBGHSVuwiQlIwZdGn3At4QAQ5ha0DBdG3q9cMa3oRgzqkjcEv9sVe6kXVRSKrJxyQvNYEWNMI87u4Iuy1p6PL2i-b7ZodX-ml0JLmRe_w2k_r-usH4auYcBJT5qv0XdukeBU7JHwJ3DaftaEs_VKbTN5O8RWEGTyPcuMTDfv43bUSGIGE8Y0Af0wfRug1jqc',
        badge_text: section?.badge_text || 'Portfolio'
    };

    const cta = {
        title: section?.cta_title || 'Ready to upgrade your climate control?',
        description: section?.cta_description || 'From residential comfort to industrial precision, our engineers are ready to design the perfect solution for your needs.',
        button_text: section?.cta_button_text || 'Contact Our Engineers',
        button_link: section?.cta_button_link || '/contact',
        secondary_text: section?.secondary_cta_text || 'Download Portfolio',
        secondary_link: section?.secondary_cta_link || '#'
    };

    return (
        <main className="flex-1">
            {/* Hero Section */}
            <div className="@container w-full">
                <div
                    className="relative flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 md:p-10"
                    style={{ backgroundImage: `linear-gradient(rgba(17, 20, 24, 0.6) 0%, rgba(17, 20, 24, 0.7) 100%), url("${hero.background_image}")` }}
                >
                    <div className="flex flex-col gap-4 text-center max-w-[800px] animate-fade-in-up">
                        <span className="text-white/90 font-bold tracking-widest uppercase text-sm">{hero.badge_text}</span>
                        <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
                            {hero.title}
                        </h1>
                        <h2 className="text-white/90 text-base md:text-lg font-normal leading-relaxed max-w-[600px] mx-auto">
                            {hero.description}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Content Container with Client-side filtering */}
            <div className="layout-container flex justify-center w-full px-4 md:px-6 lg:px-40 py-8 md:py-12">
                <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-10">
                    <ProjectsClient projects={items} />



                    {/* CTA Section */}
                    <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-white mt-8 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{cta.title}</h2>
                            <p className="text-white/80 text-lg md:text-xl">
                                {cta.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <a href={cta.button_link} className="flex items-center justify-center h-12 px-8 rounded-lg bg-white text-primary text-base font-bold hover:bg-gray-100 transition-colors shadow-lg">
                                    {cta.button_text}
                                </a>
                                <a href={cta.secondary_link} className="flex items-center justify-center h-12 px-8 rounded-lg bg-primary border-2 border-white/30 hover:bg-primary/80 hover:border-white/50 text-white text-base font-bold transition-colors">
                                    {cta.secondary_text}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
