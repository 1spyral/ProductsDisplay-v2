import { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			transitionDuration: {
				"0.3": "0.3s",
			},
			// Add custom utilities for hiding the scrollbar
			spacing: {
				'112': '28rem',
			},
		},
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function ({ addUtilities }: { addUtilities: (utilities: Record<string, any>) => void }) {
			addUtilities({
				'.scrollbar-hide': {
					/* Hide scrollbar for Internet Explorer, Edge and Firefox */
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
					/* Hide scrollbar for Chrome, Safari and Opera */
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
			});
		},
	],
};

export default config;
