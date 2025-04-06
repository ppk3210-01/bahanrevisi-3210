
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Custom colors for the budget app - enhanced with more vibrant colors
				'changed-row': '#FEF7CD', // Yellow
				'new-row': '#F2FCE2',     // Green
				'deleted-row': '#FFDEE2', // Red
				'warning-box': '#ea384c', // Red
                
				// Add more color options
				'budget-blue': {
					50: '#e6f1ff',
					100: '#c8e0ff',
					200: '#99c0ff',
					300: '#66a1ff',
					400: '#3381ff',
					500: '#0066ff',
					600: '#0052cc',
					700: '#003d99',
					800: '#002966',
					900: '#001433',
				},
				'budget-green': {
					50: '#e6fff2',
					100: '#c8ffe6',
					200: '#99ffcc',
					300: '#66ffb3',
					400: '#33ff99',
					500: '#00ff80',
					600: '#00cc66',
					700: '#00994d',
					800: '#006633',
					900: '#00331a',
				},
				'budget-orange': {
					50: '#fff0e6',
					100: '#ffe0c8',
					200: '#ffc199',
					300: '#ffa366',
					400: '#ff8533',
					500: '#ff6600',
					600: '#cc5200',
					700: '#993d00',
					800: '#662900',
					900: '#331400',
				},
				'budget-purple': {
					50: '#f2e6ff',
					100: '#e0c8ff',
					200: '#c199ff',
					300: '#a366ff',
					400: '#8533ff',
					500: '#6600ff',
					600: '#5200cc',
					700: '#3d0099',
					800: '#290066',
					900: '#140033',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			backgroundImage: {
				'gradient-card': 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
				'gradient-blue': 'linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)',
				'gradient-green': 'linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)',
				'gradient-orange': 'linear-gradient(90deg, hsla(29, 92%, 70%, 1) 0%, hsla(0, 87%, 73%, 1) 100%)',
				'gradient-purple': 'linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
