import React from 'react';

interface NewsletterCTAProps {
    title?: string;
    description?: string;
    buttonText?: string;
    className?: string;
}

const NewsletterCTA: React.FC<NewsletterCTAProps> = ({
    title = "Stay Ahead of the Curve",
    description = "Get the latest content marketing tips delivered to your inbox.",
    buttonText = "Subscribe",
    className = ""
}) => {
    return (
        <div className={`bg-white rounded-xl p-8 md:p-12 shadow-sm ring-1 ring-slate-200 ${className}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {title}
                    </h3>
                    <p className="text-slate-600 mt-2">
                        {description}
                    </p>
                </div>
                <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <input
                        className="form-input grow w-full rounded-lg h-12 px-3 bg-slate-100 border-transparent focus:border-primary focus:ring-primary/50 text-slate-900"
                        placeholder="Enter your email"
                        type="email"
                    />
                    <button
                        className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                        type="submit"
                    >
                        {buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewsletterCTA;
