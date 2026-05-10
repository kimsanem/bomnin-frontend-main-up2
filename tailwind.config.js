/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/app.vue',
    './app/pages/**/*.{vue,js,ts}',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
  ],

  theme: {
    extend: {
      fontFamily: {
        moul: ['Moul', 'sans-serif'],
        kantumruy: ['KantumruyPro', 'sans-serif'],
        kohsantepheap: ['Koh Santepheap', 'KantumruyPro', 'sans-serif'],
      },
    },
  },

  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
