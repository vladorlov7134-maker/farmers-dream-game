// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ДОБАВЛЕНО: экраны для адаптивного дизайна
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      animation: {
        'xpFloat': 'xpFloat 1s ease-out forwards',
        'slideDown': 'slideDown 0.3s ease',
        'popIn': 'popIn 0.3s ease',
      },
      keyframes: {
        xpFloat: {
          '0%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          },
          '100%': {
            opacity: 0,
            transform: 'translateY(-50px) scale(1.2)'
          },
        },
        slideDown: {
          'from': {
            opacity: 0,
            transform: 'translateY(-10px)'
          },
          'to': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        popIn: {
          '0%': {
            opacity: 0,
            transform: 'scale(0.8)'
          },
          '100%': {
            opacity: 1,
            transform: 'scale(1)'
          }
        }
      }
    },
  },
  plugins: [],
}