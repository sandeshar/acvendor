import React from 'react';
import NewsletterCTA from '@/components/shared/NewsletterCTA';

interface BlogCTAProps {
    data: {
        title: string;
        description: string;
        button_text: string;
    };
}

const BlogCTA = ({ data }: BlogCTAProps) => {
    return (
        <NewsletterCTA
            className="mt-20 mb-10"
            title={data.title}
            description={data.description}
            buttonText={data.button_text}
        />
    );
};

export default BlogCTA;
