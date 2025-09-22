/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "btn-red": '#BC221B',
        "txt-red": '#BC221B',
        "background-red": '#BC221B',
        "text-white": '#FFFFFF',
        "background-footer": "#2E3538"
      },
    },
  },
  plugins: [],
}