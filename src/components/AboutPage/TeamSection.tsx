import TeamMemberCard from './TeamMemberCard';

interface AboutTeamSectionData {
    id: number;
    title: string;
    description: string;
    is_active: number;
    updatedAt: Date;
}

interface AboutTeamMemberData {
    id?: number;
    name: string;
    role: string;
    description: string;
    image: string;
    image_alt: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface TeamSectionProps {
    section?: AboutTeamSectionData | null;
    members?: AboutTeamMemberData[];
}

const TeamSection = ({ section, members = [] }: TeamSectionProps) => {
    if (!section) {
        return null;
    }

    return (
        <section className="w-full px-4 md:px-10 py-20 sm:py-32">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-black leading-tight tracking-[-0.02em] text-slate-900 md:text-5xl">
                        {section.title}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                        {section.description}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {members.map((member, i) => (
                        <TeamMemberCard
                            key={member.id ?? `team-${i}`}
                            name={member.name}
                            role={member.role}
                            description={member.description}
                            image={member.image}
                            alt={member.image_alt}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;
