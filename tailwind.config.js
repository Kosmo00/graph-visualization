/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // bg and cards (sometimes text)
        'main-primary': 'var(--main-primary)',
        'main-secondary': 'var(--main-secondary)',
        'main-third': 'var(--main-third)',
        // text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-third': 'var(--text-third)',
        //hover and emphasis
        'hover': 'var(--hover)',
        'emphasis': 'var(--emphasis)',
        // red
        'red-dark': 'var(--red-dark)',
        'red': 'var(--red)',
        'red20':'var(--red20)',
        'red40':'var(--red40)',
        'red60':'var(--red60)',
        'red80':'var(--red80)',
        // green
        'green-dark': 'var(--green-dark)',
        'green': 'var(--green)',
        'green20':'var(--green20)',
        'green40':'var(--green40)',
        'green60':'var(--green60)',
        'green80':'var(--green80)',
      }
    },
  },
  plugins: [],
}

