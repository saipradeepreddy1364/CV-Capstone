/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          bg: '#090d16',
          surface: '#111827',
          card: '#1e293b',
          border: '#334155',
        },
        status: {
          present: '#10b981',
          late: '#f59e0b',
          absent: '#ef4444',
          noclass: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}
