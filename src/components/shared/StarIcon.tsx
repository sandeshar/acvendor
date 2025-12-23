const StarIcon = ({ className = 'h-4 w-4 text-yellow-400' }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path d="M12 .587l3.668 7.431L24 9.753l-6 5.854 1.416 8.262L12 19.771 4.584 23.869 6 15.607 0 9.753l8.332-1.735L12 .587z" />
    </svg>
);

export default StarIcon;
