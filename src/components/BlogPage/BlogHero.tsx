import React from 'react';

interface BlogHeroProps {
    data: {
        title: string;
        subtitle: string;
        background_image: string;
    };
}

const BlogHero = ({ data }: BlogHeroProps) => {
    return (
        <div className="mb-10">
            <div className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4"
                style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("${data.background_image}")` }}
            >
                <div className="flex flex-col gap-4 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-6xl">
                        {data.title}
                    </h1>
                    <h2 className="text-slate-200 text-base font-normal leading-normal sm:text-lg max-w-2xl">
                        {data.subtitle}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default BlogHero;
