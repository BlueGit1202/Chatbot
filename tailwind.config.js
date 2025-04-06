module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}','./node_modules/@fortawesome/**/*.{js,ts,vue}','./node_modules/@iconify/**/*.{js,ts,vue}'],
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        extend: {},
    },
    plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography')],
}
