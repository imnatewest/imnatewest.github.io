/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#151725',
        mist: '#5a5c72',
        accent: '#2f5ef7',
        night: '#0f172a',
        nightMuted: '#94a3b8',
        nightSurface: '#121b35',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        highlight: '0 20px 45px rgba(15, 23, 42, 0.08)',
        card: '0 25px 50px rgba(15, 23, 42, 0.06)',
        panel: '0 35px 60px rgba(47, 94, 247, 0.1)',
      },
    },
  },
  plugins: [],
}
