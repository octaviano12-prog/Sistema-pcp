/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#1e40af', 700: '#1e3a8a', 800: '#172554', 900: '#0f172a' },
        accent: { 500: '#f97316', 600: '#ea580c' },
        success: { 500: '#22c55e', 600: '#16a34a' },
        danger: { 500: '#ef4444', 600: '#dc2626' },
      },
    },
  },
  plugins: [],
};
