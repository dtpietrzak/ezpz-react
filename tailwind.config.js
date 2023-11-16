/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,tsx}',
    './build/csr/**/*.{html,js,ts,tsx}',
    './build/ssr/**/*.{html,js,ts,tsx}',
  ],
  theme: {},
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}