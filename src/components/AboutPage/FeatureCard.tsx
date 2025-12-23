import React from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
    return (
        <div className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-muted">
            {icon && <div className="mb-3">{icon}</div>}
            <h4 className="text-sm font-bold tracking-wide text-primary-var uppercase">{title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-subtext">{description}</p>
        </div>
    );
};

export default FeatureCard;
