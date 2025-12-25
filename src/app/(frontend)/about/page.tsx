import AboutHero from "@/components/AboutPage/AboutHero";
import AboutJourney from "@/components/AboutPage/AboutJourney";
import AboutPhilosophy from "@/components/AboutPage/AboutPhilosophy";
import TeamSection from "@/components/AboutPage/TeamSection";
import AboutCTA from "@/components/AboutPage/AboutCTA";
import TestimonialSlider from "@/components/shared/TestimonialSlider";


async function getAboutPageData() {

    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const [
            heroRes,
            journeyRes,
            statsRes,
            featuresRes,
            philosophyRes,
            principlesRes,
            teamSectionRes,
            teamMembersRes,
            certificationsRes,
            certificationsSectionRes,
            badgesRes,
            ctaRes
        ] = await Promise.all([
            fetch(`${baseUrl}/api/pages/about/hero`, { next: { tags: ['about-hero'] } }),
            fetch(`${baseUrl}/api/pages/about/journey`, { next: { tags: ['about-journey'] } }),
            fetch(`${baseUrl}/api/pages/about/stats`, { next: { tags: ['about-stats'] } }),
            fetch(`${baseUrl}/api/pages/about/features`, { next: { tags: ['about-features'] } }),
            fetch(`${baseUrl}/api/pages/about/philosophy`, { next: { tags: ['about-philosophy'] } }),
            fetch(`${baseUrl}/api/pages/about/principles`, { next: { tags: ['about-principles'] } }),
            fetch(`${baseUrl}/api/pages/about/team-section`, { next: { tags: ['about-team-section'] } }),
            fetch(`${baseUrl}/api/pages/about/team-members`, { next: { tags: ['about-team-members'] } }),
            fetch(`${baseUrl}/api/pages/about/certifications`, { next: { tags: ['about-certifications'] } }),
            fetch(`${baseUrl}/api/pages/about/certifications-section`, { next: { tags: ['about-certifications-section'] } }),
            fetch(`${baseUrl}/api/pages/about/badges`, { next: { tags: ['about-badges'] } }),
            fetch(`${baseUrl}/api/pages/about/cta`, { next: { tags: ['about-cta'] } }),
        ]);

        const hero = heroRes.ok ? await heroRes.json() : null;
        const journey = journeyRes.ok ? await journeyRes.json() : null;
        const stats = statsRes.ok ? await statsRes.json() : [];
        const features = featuresRes.ok ? await featuresRes.json() : [];
        const philosophy = philosophyRes.ok ? await philosophyRes.json() : null;
        const principles = principlesRes.ok ? await principlesRes.json() : [];
        const teamSection = teamSectionRes.ok ? await teamSectionRes.json() : null;
        const teamMembers = teamMembersRes.ok ? await teamMembersRes.json() : [];
        const certifications = certificationsRes.ok ? await certificationsRes.json() : [];
        const certificationsSection = certificationsSectionRes.ok ? await certificationsSectionRes.json() : null;
        const badges = badgesRes.ok ? await badgesRes.json() : [];
        const cta = ctaRes.ok ? await ctaRes.json() : null;

        return {
            hero,
            journey,
            stats,
            features,
            philosophy,
            principles,
            teamSection,
            teamMembers,
            certifications,
            certificationsSection,
            badges,
            cta,
        };
    } catch (error) {
        console.error('Error fetching about page data:', error);
        return {
            hero: null,
            journey: null,
            stats: [],
            features: [],
            philosophy: null,
            principles: [],
            teamSection: null,
            teamMembers: [],
            cta: null,
        };
    }
}

export default async function AboutPage() {
    const data = await getAboutPageData();

    return (
        <main className="flex flex-col items-center page-bg">
            <div className="flex flex-col w-full">
                <AboutHero data={data.hero} />
                <AboutJourney section={data.journey} stats={data.stats} features={data.features} badges={data.badges} certifications={data.certifications} certificationsSection={data.certificationsSection} />
                <AboutPhilosophy section={data.philosophy} principles={data.principles} />
                <TeamSection section={data.teamSection} members={data.teamMembers} />
                <TestimonialSlider
                    filter="about"
                    title={data.certificationsSection?.title || ''}
                    subtitle={data.certificationsSection?.subtitle || ''}
                />
                <AboutCTA data={data.cta} />
            </div>
        </main>
    );
}
