/** @type {import('tailwindcss').Config} */

const flowbite = require("flowbite-react/tailwind");

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
	theme: {
		extend: {
			spacing: {
				'128': '32rem',
				'138': '36rem',
				'192': '48rem',
				'216' : '54rem',
				'256': '64rem',
			},
			backgroundImage: {
				'farmer-cartoon': "url('./src/assets/dashboard_bg.png')"
			}
		},
		colors: {
			"custom-green-1" : "#09694d",
			"custom-green-2" : "#019A6C",
			"custom-green-3" : "#EFF1E8",
			"custom-white" : "#f9f9f9",
			"custom-brown-1": "#aa9970",
			"custom-brown-2": "#c4b99d",
			"custom-brown-3": "#ded9cb",
		}
	},
	plugins: [flowbite.plugin()],
};
