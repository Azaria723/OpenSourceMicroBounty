/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F5F1FA',
        surface: '#FFFDFE',
        surfaceDark: '#EFE9F7',
        lavenderSoft: '#E6D9F4',
        lavenderDark: '#B99AD7',
        violetAccent: '#6E4B8E',
        deepInk: '#211A2B',
        mutedText: '#786E82',
        borderLine: '#DCD2E8',
        greenStatus: '#628B72',
        amberStatus: '#B98245',
        roseStatus: '#A85C67',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
