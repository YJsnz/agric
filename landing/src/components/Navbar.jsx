import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import MobileMenu from './MobileMenu'
import { NAV_LINKS, PLATFORM_URL } from '../links'

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  // 首页是深色视频 hero，其余页面为浅色主题：导航栏随页面切换深浅
  const onDark = pathname === '/'

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          onDark
            ? 'bg-gradient-to-b from-black/60 to-transparent'
            : 'border-b border-slate-200/80 bg-white/90 backdrop-blur-xl'
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6 lg:px-16">
          <div className="flex items-center gap-10">
            <Link
              to="/"
              className={`font-semibold text-lg tracking-tight ${onDark ? 'text-white' : 'text-ink'}`}
            >
              田言耕智
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-light transition-colors duration-200 ${
                      isActive
                        ? 'font-medium text-brand-dark'
                        : onDark
                          ? 'text-white/80 hover:text-white'
                          : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/sign-in"
              className={`hidden text-sm font-light transition-colors duration-200 md:inline-block ${
                onDark ? 'text-white/80 hover:text-white' : 'text-muted hover:text-ink'
              }`}
            >
              登录
            </Link>
            <a
              href={PLATFORM_URL}
              className={`hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 md:inline-block ${
                onDark ? 'bg-white text-black hover:bg-white/90' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              进入平台
            </a>

            {/* 汉堡按钮（仅移动端） */}
            <button
              type="button"
              aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              className="relative h-6 w-6 focus:outline-none md:hidden"
            >
              <span
                className={`absolute left-0 top-0 h-[2px] w-6 rounded-full transition-all duration-500 ${EASE} ${
                  onDark ? 'bg-white' : 'bg-ink'
                } ${menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 rounded-full transition-all duration-500 ${EASE} ${
                  onDark ? 'bg-white' : 'bg-ink'
                } ${menuOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[2px] w-6 rounded-full transition-all duration-500 ${EASE} ${
                  onDark ? 'bg-white' : 'bg-ink'
                } ${menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : ''}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
