/** @type {import('tailwindcss').Config} */
import { radixThemePreset } from 'radix-themes-tw';
const { blackA, mauve, violet } = require('@radix-ui/colors');

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ...blackA,
        ...mauve,
        ...violet,
      },
    },
  },
  plugins: [],
  presets: [radixThemePreset]
}

