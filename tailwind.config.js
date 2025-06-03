/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#634C9F',
        'primary-light': '#ede8f7',
        main: '#fafafa',
      },
    },
  },
  plugins: [],
}

