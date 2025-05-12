/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1320px',
      xxl: '1600px',
    },
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem',
          sm: '1.25rem',
          md: '2rem',
          lg: '2.25rem',
          xxl: '3rem',
        },
      },
      colors: {
        main: '#4BC8BE',
        main2: '#28A99E',
        main3: '#039185',
        mainText: '#333333',
        additionalText: '#666666',
        light: '#F6F6F6',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        myshine: {
          '0%': { top: '-150%', left: '-150%' },
          '100%': { top: '150%', left: '150%' },
        },
      },
      animation: {
        myshine: 'myshine 3s linear infinite',
      },
    },
  },
  plugins: [],
};
