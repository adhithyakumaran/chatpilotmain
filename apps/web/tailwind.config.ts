import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#8B5CF6',   // Violet-500 (Vivid Purple)
                    secondary: '#7C3AED', // Violet-600 (Darker Purple)
                    dark: '#1E1B4B',      // Indigo-950 (Text)
                    light: '#F5F3FF',     // Violet-50 (Light bg)
                    accent: '#A78BFA',    // Violet-400 (Highlights)
                    white: '#FFFFFF',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                // Removed SaaS ingredients, keeping strictly warm gradients if needed
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'float': 'float 4s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
                    '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
};

export default config;
