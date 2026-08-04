import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_LINKS, PLATFORM_URL } from '../links'

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]'

export default function MobileMenu({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-700 ${EASE} md:hidden ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />

      <div className="relative z-10 flex h-full flex-col px-6 py-5">
        <div className="flex items-center justify-between">
          <NavLink to="/" onClick={onClose} className="font-semibold text-lg tracking-tight text-ink">
            田言耕智
          </NavLink>
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={onClose}
            className="relative h-6 w-6 focus:outline-none"
          >
            <span className="absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-ink rotate-45" />
            <span className="absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-ink -rotate-45" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center justify-center">
          {NAV_LINKS.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full py-4 text-center border-b border-slate-100 text-4xl sm:text-5xl font-instrument-serif transition-all duration-700 ${EASE} hover:pl-4 ${
                  isActive ? 'text-brand-dark' : 'text-ink'
                } ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`
              }
              style={{ transitionDelay: open ? `${150 + i * 80}ms` : '0ms' }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div
          className={`pb-10 transition-all duration-700 ${EASE} ${
            open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: open ? '550ms' : '0ms' }}
        >
          <div className="mb-5 flex justify-center gap-8 text-sm font-light text-muted">
            <NavLink to="/sign-in" onClick={onClose} className="transition-colors hover:text-ink">
              登录
            </NavLink>
            <NavLink to="/sign-up" onClick={onClose} className="transition-colors hover:text-ink">
              注册
            </NavLink>
          </div>
          <a
            href={PLATFORM_URL}
            onClick={onClose}
            className="block w-full rounded-full bg-emerald-600 py-4 text-center font-medium text-white"
          >
            进入平台
          </a>
        </div>
      </div>
    </div>
  )
}
