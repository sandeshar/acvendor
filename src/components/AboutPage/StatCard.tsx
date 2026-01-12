import React from 'react';

interface StatCardProps {
    value: string;
    label: string;
}

const StatCard = ({ value, label }: StatCardProps) => {
    return (
        <div className="rounded-lg border border-muted bg-card py-6 text-center shadow-sm hover:shadow-md transition">
            <div className="text-2xl font-extrabold tracking-tight text-primary">{value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-subtext">{label}</div>
        </div>
    );
};

export default StatCard;
