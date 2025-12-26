import React from 'react';
import FeatureCard from './FeatureCard';
import { DEFAULT_FEATURES } from '@/db/aboutPageDefaults';

interface AboutFeatureData {
    id?: number;
    title: string;
    description: string;
    icon?: string;
}

interface AboutFeaturesProps {
    features?: AboutFeatureData[];
}

const AboutFeatures = ({ features = [] }: AboutFeaturesProps) => {
    const items = features.length > 0 ? features.slice(0, 3) : DEFAULT_FEATURES.slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((feature, idx) => (
                <FeatureCard
                    key={feature.id || feature.title || idx}
                    title={feature.title}
                    description={feature.description}
                    icon={<span className="material-symbols-outlined">{feature.icon || 'support_agent'}</span>}
                />
            ))}
        </div>
    );
};

export default AboutFeatures;
