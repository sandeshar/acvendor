import React from 'react';

interface PrincipleCardProps {
    number: number;
    title: string;
    description: string;
}

const PrincipleCard = ({ number, title, description }: PrincipleCardProps) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-sm ring-1 ring-muted transition-shadow hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-20 text-xl font-black text-primary-var">
                {number}
            </div>
            <h3 className="text-xl font-bold text-body">{title}</h3>
            <p className="text-base leading-relaxed text-subtext">{description}</p>
        </div>
    );
};

export default PrincipleCard;
