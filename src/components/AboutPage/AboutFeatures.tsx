import React from 'react';
import FeatureCard from './FeatureCard';

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
    const items = features.length > 0 ? features.slice(0, 3) : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(items.length > 0 ? items : [
                { title: '24/7 Support', description: 'AC breakdown in the middle of summer? Our emergency repair team is on standby round-the-clock in major cities.', icon: 'support_agent' },
                { title: 'Genuine Parts', description: 'We guarantee 100% authentic spare parts directly from manufacturers to ensure the longevity of your system.', icon: 'verified_user' },
                { title: 'Energy Efficient', description: 'Our modern inverter solutions are designed to lower your electricity bills while maximizing cooling output.', icon: 'bolt' },
            ]).map((feature, idx) => (
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
