import { ArrowRight } from 'lucide-react'

/** 章节小徽章：浅绿胶囊 */
export function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {children}
    </span>
  )
}

/** 页面主视觉 */
export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-14 md:px-12 md:pt-40 lg:px-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_62%)]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-[120px]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 font-instrument-serif text-ink text-4xl leading-[1.12] sm:text-5xl md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl font-light text-muted leading-relaxed md:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">{children}</div>}
      </div>
    </section>
  )
}

/** 浅色图标块（shadcn 卡片风格） */
const ICON_TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
  teal: 'bg-teal-100 text-teal-700'
}

export function IconChip({ icon: Icon, tone = 'emerald', className = '' }) {
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ICON_TONES[tone]} ${className}`}>
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </div>
  )
}

/** 主按钮（实心绿） */
export function PrimaryButton({ href, children, className = '' }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  )
}

/** 描边按钮 */
export function OutlineButton({ href, children, className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 px-8 py-3.5 text-sm font-medium text-ink transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 ${className}`}
    >
      {children}
    </a>
  )
}

/** 大数字统计条（浅色渐变带） */
export function StatBand({ stats }) {
  return (
    <section className="bg-gradient-to-r from-emerald-50 via-sky-50 to-emerald-50 px-6 py-16 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.value} className="text-center">
            <p className="font-instrument-serif text-4xl text-emerald-600 md:text-5xl">{stat.value}</p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-widest text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/** CTA 渐变色带 */
export function CtaBand({ title, subtitle, href, label }) {
  return (
    <section className="px-6 pb-24 md:px-12 lg:px-16">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-16 text-center shadow-2xl shadow-emerald-600/20 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-[90px]" />
        <h2 className="relative font-instrument-serif text-3xl text-white sm:text-4xl">{title}</h2>
        {subtitle && (
          <p className="relative mx-auto mt-4 max-w-xl font-light text-white/80 leading-relaxed">{subtitle}</p>
        )}
        <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={href}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10"
          >
            {label}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

/** 区块标题（浅色） */
export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-instrument-serif text-3xl text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 font-light text-muted leading-relaxed">{subtitle}</p>}
    </div>
  )
}

// 兼容旧页面命名：整个站点已统一为浅色主题
export const DarkSectionTitle = SectionTitle
export const LightSectionTitle = SectionTitle
