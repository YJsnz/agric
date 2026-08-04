import { Link } from 'react-router-dom'
import { NAV_LINKS, PLATFORM_URL, ASSISTANT_URL, TWIN_URL } from '../links'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-14 md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-semibold text-lg tracking-tight text-ink">田言耕智</p>
          <p className="mt-3 max-w-sm text-sm font-light text-muted leading-relaxed">
            AI 原生智慧农业与数字孪生平台。不用寻找数据，直接询问数据；不必浏览报表，直接进入农场。
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">导航</p>
          <ul className="space-y-3 text-sm font-light text-muted">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors duration-200 hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">进入平台</p>
          <ul className="space-y-3 text-sm font-light text-muted">
            <li><a href={PLATFORM_URL} className="transition-colors duration-200 hover:text-ink">数据工作台</a></li>
            <li><a href={ASSISTANT_URL} className="transition-colors duration-200 hover:text-ink">智能问农</a></li>
            <li><a href={TWIN_URL} className="transition-colors duration-200 hover:text-ink">数字孪生</a></li>
            <li><Link to="/contact" className="transition-colors duration-200 hover:text-ink">联系我们</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs font-light text-muted sm:flex-row">
        <span>© 2026 田言耕智 · AI 原生智慧农业与数字孪生平台</span>
        <span>为现代农业而设计</span>
      </div>
    </footer>
  )
}
