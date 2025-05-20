const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}", 
    
  ],
  theme: {
    extend: {
        boxShadow: {
            sm: '0px 2px 10px 2px rgba(0, 0, 0, 0.05)',
            md: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)',
        },
        colors: {
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            'blue-bg-light': 'rgba(27, 61, 106, 0.07)',
            'mint-bg': '#D3EEE9',
            'text-dark': '#181818',
            card: {
                DEFAULT: 'hsl(var(--card))',
                foreground: 'hsl(var(--card-foreground))',
            },
            popover: {
                DEFAULT: 'hsl(var(--popover))',
                foreground: 'hsl(var(--popover-foreground))',
            },
            primary: {
                DEFAULT: 'hsl(var(--primary))',
                foreground: '#fff',
            },
            secondary: {
                DEFAULT: 'hsl(var(--secondary))',
                foreground: '#fff',
            },
            tertiary: {
                DEFAULT: 'hsl(var(--tertiary))',
                foreground: '#fff',
            },
            muted: {
                DEFAULT: 'hsl(var(--muted))',
                foreground: 'hsl(var(--muted-foreground))',
            },
            accent: {
                DEFAULT: 'hsl(var(--accent))',
                foreground: '#fff',
            },
            destructive: {
                DEFAULT: 'hsl(var(--destructive))',
                foreground: '#fff',
            },
            warning: {
                DEFAULT: 'hsl(var(--warning))',
                foreground: '#fff',
            },
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))',
            chart: {
                '1': 'hsl(var(--chart-1))',
                '2': 'hsl(var(--chart-2))',
                '3': 'hsl(var(--chart-3))',
                '4': 'hsl(var(--chart-4))',
                '5': 'hsl(var(--chart-5))',
            },
        },
        borderRadius: {
            sm: 'var(--radius)',
            md: 'calc(var(--radius) + 5px)',
            lg: 'calc(var(--radius) + 5px)',
            'bottom-curved': '0 0 70px 70px',
        },
        fontSize: {
            '2xs': '.625rem', // Default example (10px)
            xs: '.75rem', // Default example (12px)
            sm: '.875rem', // Default example (14px)
            base: '1rem', // Default example (16px)
            lg: '1.125rem', // Default example (18px)
            xl: '1.25rem', // Default example (20px)
            '2xl': '1.5rem', // Default example (24px)
            '3xl': '2rem', // Default example (32px)
            '4xl': '2.625rem', // Default example (42px)
            '5xl': '3rem', // Default example (48px)
            '6xl': '4rem', // Default example (64px),
        },
        maxWidth: {
            'screen-lg': '75rem', // Custom value (640px by default, adjust as needed)
        },
        keyframes: {
            'accordion-down': {
                from: { height: '0' },
                to: { height: 'var(--radix-accordion-content-height)' },
            },
            'accordion-up': {
                from: { height: 'var(--radix-accordion-content-height)' },
                to: { height: '0' },
            },
            dropdown: {
                '0%': { opacity: '0', transform: 'scale(0.95) translateY(-10px)' },
                '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
            },
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
        },
        animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
            'spin-slow': 'spin 1s linear infinite',
            dropdown: 'dropdown 0.2s ease-out',
            fadeIn: 'fadeIn 0.5s ease-out',
        },
        fontWeight: {
            inherit: 'inherit',
        },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
