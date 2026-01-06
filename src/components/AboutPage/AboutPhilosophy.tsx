import React from 'react';
import PrincipleCard from './PrincipleCard';

interface AboutPhilosophySectionData {
    id: number;
    title: string;
    description: string;
    is_active: number;
    updatedAt: Date;
}

interface AboutPrincipleData {
    id?: number;
    title: string;
    description: string;
    display_order: number;
    is_active: number;
    createdAt: Date;
    updatedAt: Date;
}

interface AboutPhilosophyProps {
    section?: AboutPhilosophySectionData | null;
    principles?: AboutPrincipleData[];
}

const AboutPhilosophy = ({ section, principles = [] }: AboutPhilosophyProps) => {
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
                <div className="grid gap-8 md:grid-cols-3">
                    {principles.map((principle, index) => (
                        <PrincipleCard
                            key={principle.id ?? `principle-${index}`}
                            number={index + 1}
                            title={principle.title}
                            description={principle.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutPhilosophy;
