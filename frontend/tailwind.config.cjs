module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{ farm: { primary: '#34734a', secondary: '#85a96e', accent: '#d8aa4e', neutral: '#25372a', 'base-100': '#f8fbf6', info: '#5898a8', success: '#4d9661', warning: '#d49a3d', error: '#c96157' } }],
    base: false,
    styled: true,
    utils: true,
    prefix: 'daisy-'
  }
}
