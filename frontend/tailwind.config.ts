import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
       fontFamily: {
         sans: ["var(--font-montserrat)", ...fontFamily.sans],
         heading: ["var(--font-roboto)", ...fontFamily.sans],
       },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
            positive: 'hsl(var(--positive))', // Added positive color
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
            "accordion-down": {
                from: { height: "0" },
                to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
                from: { height: "var(--radix-accordion-content-height)" },
                to: { height: "0" },
            },
            "fade-in-up": {
                from: { opacity: '0', transform: 'translateY(20px)' },
                to: { opacity: '1', transform: 'translateY(0)' },
            },
            "fade-in": {
                 from: { opacity: '0' },
                 to: { opacity: '1'},
            },
             "count-up": {
                from: { opacity: '0', transform: 'translateY(10px)' },
                 to: { opacity: '1', transform: 'translateY(0)' },
            },
             "bounce-sm": {
                 '0%, 100%': { transform: 'translateY(0)' },
                 '50%': { transform: 'translateY(-5px)' },
            },
            "bounce": {
                '0%, 100%': {
                    transform: 'translateY(0)',
                    animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
                 },
                 '50%': {
                    transform: 'translateY(-25%)',
                    animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
                 },
            },
            "slide-down-fade": {
              from: { opacity: '0', transform: 'translateY(-10px)' },
              to: { opacity: '1', transform: 'translateY(0)' },
            },
            "pulse-slow": {
              '0%, 100%': { opacity: '1', transform: 'scale(1)' },
              '50%': { opacity: '0.8', transform: 'scale(1.03)' },
            },
            "float": {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            },
        },
  		animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
            "fade-in-up": "fade-in-up 0.6s ease-out forwards",
            "fade-in": "fade-in 0.5s ease-out forwards",
            "count-up": "count-up 0.5s ease-out forwards",
            "bounce-sm": "bounce-sm 1s ease-in-out infinite",
            "bounce": "bounce 1s infinite",
            "slide-down-fade": "slide-down-fade 0.3s ease-out forwards",
            "pulse-slow": "pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "float": "float 3s ease-in-out infinite",
        },
         animationDelay: { // Custom utility for animation delays
            '200': '200ms',
            '400': '400ms',
            '600': '600ms',
            '800': '800ms',
            '1000': '1000ms',
            '1200': '1200ms',
          },
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;