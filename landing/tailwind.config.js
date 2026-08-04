module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        'instrument-serif': ['"Instrument Serif"', '"Noto Serif SC"', '"Songti SC"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        geist: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: '#10B981',
          soft: '#34D399',
          light: '#D1FAE5',
          dark: '#059669',
          deep: '#047857'
        },
        page: '#F7FAF8',
        ink: '#0F172A',
        // shadcn 风格 token（认证页组件使用，见 src/components/ui/sign-in.jsx）
        muted: { DEFAULT: '#64748B', foreground: '#71717a' },
        background: '#ffffff',
        foreground: '#18181b',
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#7c3aed',
        card: { DEFAULT: '#ffffff', foreground: '#18181b' },
        primary: { DEFAULT: '#7c3aed', foreground: '#ffffff' },
        secondary: { DEFAULT: '#f4f4f5', foreground: '#18181b' },
        accent: { DEFAULT: '#f4f4f5', foreground: '#18181b' }
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        'card-hover': '0 16px 40px -16px rgba(15,23,42,.18)'
      }
    }
  },
  plugins: []
}
