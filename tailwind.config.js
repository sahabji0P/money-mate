/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Core color system using CSS variables
                primary: {
                    DEFAULT: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    elevated: 'var(--bg-elevated)',
                    hover: 'var(--bg-hover)',
                },
                text: {
                    DEFAULT: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                },
                border: {
                    DEFAULT: 'var(--border)',
                    subtle: 'var(--border-subtle)',
                },
                // Accent colors
                accent: {
                    emerald: {
                        DEFAULT: 'var(--accent-emerald)',
                        light: 'var(--accent-emerald-light)',
                        dark: 'var(--accent-emerald-dark)',
                    },
                    rose: {
                        DEFAULT: 'var(--accent-rose)',
                        light: 'var(--accent-rose-light)',
                        dark: 'var(--accent-rose-dark)',
                    },
                    blue: {
                        DEFAULT: 'var(--accent-blue)',
                        light: 'var(--accent-blue-light)',
                    },
                    amber: 'var(--accent-amber)',
                    purple: 'var(--accent-purple)',
                },
                // Semantic colors
                success: 'var(--accent-emerald)',
                danger: 'var(--accent-rose)',
                info: 'var(--accent-blue)',
                warning: 'var(--accent-amber)',
            },
            fontFamily: {
                sans: ['var(--font-primary)'],
                mono: ['var(--font-mono)'],
            },
            borderRadius: {
                'sm': '6px',
                'base': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                'card': '16px',
            },
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                'glow-emerald': 'var(--shadow-glow-emerald)',
                'glow-rose': 'var(--shadow-glow-rose)',
            },
            transitionDuration: {
                'fast': '150ms',
                'base': '200ms',
                'slow': '300ms',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            fontSize: {
                // Typography scale
                'xs': ['0.75rem', { lineHeight: '1', letterSpacing: '-0.01em' }],
                'sm': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '-0.008em' }],
                'base': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '-0.011em' }],
                'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
                'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.015em' }],
                '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
                '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
                '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
                '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.4s ease-out forwards',
                'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
                'scale-in': 'scale-in 0.2s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    from: { opacity: '0', transform: 'translateX(20px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
