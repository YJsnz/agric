import { Link } from 'react-router-dom'
import { NAV_LINKS, PLATFORM_URL, ASSISTANT_URL, TWIN_URL } from '../links'
import BrandLogo from './BrandLogo'

const platformLinks = [
  { label: '数据工作台', href: PLATFORM_URL },
  { label: '智能问农', href: ASSISTANT_URL },
  { label: '数字孪生', href: TWIN_URL }
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <section className="footer-brand">
            <div className="footer-wordmark"><BrandLogo /></div>
            <p>AI 原生智慧农业与数字孪生平台。不用寻找数据，直接询问数据；不必浏览报表，直接进入农场。</p>
            <a className="footer-cta" href={PLATFORM_URL}>进入智慧农场 <span>↗</span></a>
          </section>

          <nav className="footer-column" aria-label="官网导航">
            <h3>探索官网</h3>
            <ul>{NAV_LINKS.map(link => <li key={link.to}><Link to={link.to}>{link.label}</Link></li>)}</ul>
          </nav>
          <nav className="footer-column" aria-label="平台入口">
            <h3>产品能力</h3>
            <ul>{platformLinks.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
          </nav>
          <nav className="footer-column" aria-label="联系信息">
            <h3>关于我们</h3>
            <ul><li><Link to="/about">平台愿景</Link></li><li><Link to="/solutions">行业方案</Link></li><li><Link to="/contact">联系我们</Link></li></ul>
          </nav>
        </div>

        <div className="footer-meta">
          <span>© 2026 田言耕智</span>
          <span className="footer-status"><i></i>所有服务运行正常</span>
          <span>智慧农业 · AI 原生</span>
        </div>
      </div>
    </footer>
  )
}
