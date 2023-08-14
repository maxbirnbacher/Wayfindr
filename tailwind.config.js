/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.html",
    "./src/**/*.js",
    "./src/**/*.css",
    "./views/**/*.ejs",
    "./views/*.ejs",
    "./public/**/*.js",
    "./public/**/*.css",
    "./routes/*.js",
    "./tableElements/*.js",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      'emerald': {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
      }
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('flowbite/plugin')
  ],
};

