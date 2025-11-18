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
                // Monochromatic color system using CSS variables
                primary: {
                    DEFAULT: 'var(--bg-primary)',
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
            },
            fontFamily: {
                sans: ['var(--font-primary)'],
                mono: ['var(--font-mono)'],
            },
            borderRadius: {
                base: '12px',
                card: '16px',
            },
            transitionDuration: {
                fast: '150ms',
                base: '300ms',
                slow: '500ms',
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            fontSize: {
                // Refined typography scale
                'body-sm': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '-0.008em' }],
                'body': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '-0.011em' }],
                'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.011em' }],
                'heading-3': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
                'heading-2': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
                'heading-1': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
                'metadata': ['0.75rem', { lineHeight: '1', letterSpacing: '-0.01em' }],
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
            },
            spacing: {
                // Generous spacing for breathing room
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
        },
    },
    plugins: [],
}
