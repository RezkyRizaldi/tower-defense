const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js}'],
	theme: {
		extend: {
			colors: {
				'gold': 'rgb(255, 215, 0)',
			},
			fontFamily: {
				'changa-one': ['Changa One', 'cursive'],
			},
		},
	},
	plugins: [
		plugin(({ addUtilities }) => {
			addUtilities({
				'.webkit-text-stroke': {
					WebkitTextStrokeWidth: '3px',
					WebkitTextStrokeColor: 'black',
				},
			});
		}),
	],
};
