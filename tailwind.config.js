module.exports = {
	darkMode: ["class"],
	content: ["./app/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				light: '#f7f7f8',
				lightBlack: '#1f1f23',
				twitchPurple: '#772ce8',
				twitchPurpleLight: '#9147ff',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
			},
			screens: {
				xs: '375px',
				'2xl': '1440px',
				'3xl': '1800px',
				betterhover: {
					raw: '(hover: hover)'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
