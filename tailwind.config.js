/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F4E79',
          light: '#2E6DA4',
          dark: '#153854',
        },
        accent: {
          DEFAULT: '#27AE60',
          dark: '#1E8449',
        },
        danger: '#E74C3C',
        warning: '#F39C12',
      },
    },
  },
  plugins: [],
};
