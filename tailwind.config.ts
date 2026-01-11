import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // darkMode disabled; using light theme only
    theme: {
        extend: {
            colors: {
                primary: "#135bec",
                "background-light": "#f6f6f8",
                "background-dark": "#101622",
                "card-light": "#ffffff",
                "card-dark": "#182134",
                "text-light": "#111827",
                "text-dark": "#e5e7eb",
                "subtext-light": "#6b7280",
                "subtext-dark": "#9ca3af",
                "border-light": "#e5e7eb",
                "border-dark": "#374151",
            },
            fontFamily: {
                display: ["Arvo", "serif"],
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px",
            },
        },
    },
    plugins: [],
};

export default config;
