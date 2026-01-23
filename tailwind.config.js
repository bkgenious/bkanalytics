/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Consulting-grade blue palette (McKinsey-inspired)
                primary: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#b9dffd',
                    300: '#7cc5fc',
                    400: '#36a7f8',
                    500: '#0c8ce9',
                    600: '#0066cc',  // Primary brand color
                    700: '#0052a3',
                    800: '#044685',
                    900: '#093b6e',
                    950: '#062549',
                },
                // Slate neutrals for professional foundation
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                // Neutral grays for text and borders
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                // Semantic colors for tool badges
                amber: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },
                emerald: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Status colors
                red: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
            },
            fontSize: {
                // Display sizes for hero and major headers
                'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
                'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
                'display': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
                'heading-xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
                'heading': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
                'heading-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
                // Body sizes
                'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
                'body': ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                // Caption and labels
                'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
                'overline': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '600' }],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-up': 'fadeUp 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
                'spin-slow': 'spin 1.5s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            backgroundImage: {
                'grid-pattern': `linear-gradient(to right, rgba(0, 102, 204, 0.03) 1px, transparent 1px),
                                 linear-gradient(to bottom, rgba(0, 102, 204, 0.03) 1px, transparent 1px)`,
                'grid-pattern-dark': `linear-gradient(to right, rgba(96, 165, 250, 0.03) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(96, 165, 250, 0.03) 1px, transparent 1px)`,
            },
            boxShadow: {
                // Subtle elevation system
                'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06), 0 12px 28px rgba(0, 0, 0, 0.06)',
                'elevated': '0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 40px rgba(0, 0, 0, 0.04)',
                'modal': '0 20px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
                // Focus ring
                'focus-ring': '0 0 0 3px rgba(0, 102, 204, 0.25)',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
            },
            maxWidth: {
                '8xl': '88rem',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            transitionDuration: {
                '400': '400ms',
            },
        },
    },
    plugins: [],
};
