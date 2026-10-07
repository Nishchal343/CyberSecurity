/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { ink: '#08111f', panel: '#0d1a2b', mint: '#a8fbd4' },
      boxShadow: {
        glow: '0 0 0 1px rgba(168,251,212,.08), 0 20px 60px rgba(0,0,0,.25)',
      },
    },
  },
  plugins: [],
}
