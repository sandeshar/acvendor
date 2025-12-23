import React from 'react';

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    value: string;
    href?: string;
}

const InfoCard = ({ icon, title, description, value, href }: InfoCardProps) => {
    const valueContent = href ? (
        <a href={href} className="font-medium text-primary hover:underline">
            {value}
        </a>
    ) : (
        <p className="font-medium text-[#111318]">{value}</p>
    );

    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 text-primary">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#111318]">{title}</h3>
                {description && <p className="text-sm text-[#616f89]">{description}</p>}
                {valueContent}
            </div>
        </div>
    );
};

export default InfoCard;
