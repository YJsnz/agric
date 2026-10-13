module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        'instrument-serif': ['var(--ui-font-display)'],
        sans: ['var(--ui-font)'],
        geist: ['var(--ui-font)']
      },
      colors: {
        emerald:{50:'#f1f7f3',100:'#e8f1ec',200:'#c5dace',300:'#a1c5b0',400:'#7caf96',500:'#4f8b70',600:'#2f6f5c',700:'#245746',800:'#1d493a',900:'#173c30'},
        violet:{50:'#f1f7f3',100:'#e8f1ec',200:'#c5dace',300:'#a1c5b0',400:'#7caf96',500:'#4f8b70',600:'#2f6f5c',700:'#245746'},
        brand: {
          DEFAULT: 'rgb(var(--ui-brand-rgb) / <alpha-value>)',
          soft: '#60977f',
          light: 'var(--ui-brand-soft)',
          dark: 'var(--ui-brand-hover)',
          deep: 'var(--ui-brand-deep)'
        },
        page: 'var(--ui-page)',
        ink: 'var(--ui-ink)',
        // shadcn 风格 token（认证页组件使用，见 src/components/ui/sign-in.jsx）
        muted: { DEFAULT: '#64748B', foreground: '#71717a' },
        background: 'var(--ui-panel)',
        foreground: 'var(--ui-ink)',
        border: 'var(--ui-border)',
        input: 'var(--ui-border)',
        ring: 'var(--ui-brand)',
        card: { DEFAULT: '#ffffff', foreground: 'var(--ui-ink)' },
        primary: { DEFAULT: 'rgb(var(--ui-brand-rgb) / <alpha-value>)', foreground: '#ffffff' },
        secondary: { DEFAULT: '#f4f4f5', foreground: 'var(--ui-ink)' },
        accent: { DEFAULT: '#f4f4f5', foreground: 'var(--ui-ink)' }
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        'card-hover': '0 16px 40px -16px rgba(15,23,42,.18)'
      }
    }
  },
  plugins: []
}
