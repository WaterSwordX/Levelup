import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FolderTree, PenLine, Timer, BarChart3, HelpCircle, Zap, Settings } from 'lucide-react'
import ParticleCanvas from './ParticleCanvas'
import CursorGlow from './CursorGlow'
import AmbientOrbs from './AmbientOrbs'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '看板' },
  { to: '/categories', icon: FolderTree, label: '分类' },
  { to: '/record', icon: PenLine, label: '记录' },
  { to: '/focus', icon: Timer, label: '专注' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <>
      <ParticleCanvas />
      <CursorGlow />
      <AmbientOrbs />

      <div className="min-h-screen flex flex-col md:flex-row" style={{ position: 'relative', zIndex: 2 }}>
        {/* Desktop Sidebar */}
        <nav
          className="hidden md:flex flex-col w-60 shrink-0 p-3 gap-1"
          style={{
            background: 'rgba(10, 11, 15, 0.85)',
            borderRight: '1px solid var(--whisper-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-3 pt-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(232, 148, 26, 0.2), rgba(78, 205, 196, 0.1))',
                border: '1px solid rgba(232, 148, 26, 0.2)',
                boxShadow: '0 0 24px rgba(232, 148, 26, 0.1)',
              }}
            >
              <Zap size={20} style={{ color: 'var(--ember-glow)' }} />
            </div>
            <div>
              <h1
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
              >
                Levelup
              </h1>
              <p className="text-[11px] tracking-wide" style={{ color: 'var(--slate-ghost)' }}>
                技能时间追踪
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-0.5">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in nav-indicator ${
                    isActive
                      ? 'text-[var(--ember-glow)] active'
                      : 'text-[var(--silver-mist)] hover:text-[var(--bright-chalk)]'
                  }`
                }
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isActive ? 'var(--ember-soft)' : 'transparent',
                      }}
                    >
                      <item.icon size={18} />
                    </div>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 space-y-0.5" style={{ borderTop: '1px solid var(--whisper-border)' }}>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-[var(--ember-glow)]'
                    : 'text-[var(--slate-ghost)] hover:text-[var(--silver-mist)]'
                }`
              }
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                <Settings size={18} />
              </div>
              <span>设置</span>
            </NavLink>
            <NavLink
              to="/guide"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-[var(--ember-glow)]'
                    : 'text-[var(--slate-ghost)] hover:text-[var(--silver-mist)]'
                }`
              }
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <span>使用说明</span>
            </NavLink>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-6 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50"
          style={{
            background: 'rgba(10, 11, 15, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--whisper-border)',
          }}
        >
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'text-[var(--ember-glow)]' : 'text-[var(--slate-ghost)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isActive ? 'var(--ember-soft)' : 'transparent',
                    }}
                  >
                    <item.icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'text-[var(--ember-glow)]' : 'text-[var(--slate-ghost)]'
              }`
            }
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Settings size={18} />
            </div>
            <span>设置</span>
          </NavLink>
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'text-[var(--ember-glow)]' : 'text-[var(--slate-ghost)]'
              }`
            }
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <span>帮助</span>
          </NavLink>
        </nav>
      </div>
    </>
  )
}
