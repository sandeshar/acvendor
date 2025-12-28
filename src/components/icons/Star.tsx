import React from 'react';

type StarVariant = 'full' | 'half' | 'empty';

interface StarProps {
  variant?: StarVariant;
  size?: number | string;
  className?: string;
  title?: string;
}

// Filled star SVG component with optional half version via clipPath
export default function Star({ variant = 'full', size = 18, className = '', title }: StarProps) {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 18;
  return (
    <svg
      width={numericSize}
      height={numericSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={!title}
      role="img"
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <clipPath id="star-half-clip">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>

      {/* Outline path used for empty star */}
      {variant === 'empty' && (
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      )}

      {/* Full star (solid) */}
      {variant === 'full' && (
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="currentColor"
        />
      )}

      {/* Half star: draw full star, but clip half */}
      {variant === 'half' && (
        <g>
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="currentColor"
            clipPath="url(#star-half-clip)"
          />
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      )}
    </svg>
  );
}
