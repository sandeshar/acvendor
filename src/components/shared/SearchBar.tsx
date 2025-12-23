import React from 'react';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Search...",
    className = "",
    value,
    onChange
}) => {
    return (
        <label className={`flex flex-col min-w-40 h-14 w-full ${className}`}>
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-lg">
                <div className="text-subtext flex bg-card items-center justify-center pl-4 rounded-l-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-body focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-card h-full placeholder:text-subtext px-4 pl-2 text-base font-normal leading-normal"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </label>
    );
};

export default SearchBar;
