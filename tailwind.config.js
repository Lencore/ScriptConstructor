/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'google': {
          'blue': '#4285F4',
          'green': '#34A853',
          'yellow': '#FBBC05',
          'red': '#EA4335',
          'gray': {
            'light': '#EAF1FF',
            'lighter': '#C2DCFF',
            'lightest': '#A0C8FF',
            'dark': '#1A1A1A'
          }
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
