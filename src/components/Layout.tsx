import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FolderTree, PenLine, Timer, BarChart3, HelpCircle, Zap, Settings, CalendarDays } from 'lucide-react'
import ParticleCanvas from './ParticleCanvas'
import CursorGlow from './CursorGlow'
import AmbientOrbs from './AmbientOrbs'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '看板' },
  { to: '/categories', icon: FolderTree, label: '分类' },
  { to: '/record', icon: PenLine, label: '记录' },
  { to: '/focus', icon: Timer, label: '专注' },
  { to: '/days', icon: CalendarDays, label: '计时日' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Background effects */}
      <ParticleCanvas />
      <AmbientOrbs />
      <CursorGlow />

      {/* Desktop Sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 shrink-0 p-3 gap-1 sticky top-0 self-start h-screen"
        style={{
          background: 'rgba(13, 15, 20, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--whisper-border)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 px-3 pt-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'var(--ember-soft)',
              boxShadow: '0 0 20px rgba(232, 148, 26, 0.15)',
            }}
          >
            <Zap size={18} style={{ color: 'var(--ember-glow)' }} />
          </div>
          <div>
            <h1
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              Levelup
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
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
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 animate-slide-in nav-indicator ${
                  isActive
                    ? 'text-[var(--ember-glow)] active'
                    : 'text-[var(--silver-mist)] hover:text-[var(--bright-chalk)]'
                }`
              }
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150"
                    style={{
                      background: isActive ? 'var(--ember-soft)' : 'transparent',
                      boxShadow: isActive ? '0 0 12px rgba(232, 148, 26, 0.2)' : 'none',
                    }}
                  >
                    <item.icon size={17} />
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
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--ember-glow)]'
                  : 'text-[var(--slate-ghost)] hover:text-[var(--silver-mist)]'
              }`
            }
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center">
              <Settings size={17} />
            </div>
            <span>设置</span>
          </NavLink>
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[var(--ember-glow)]'
                  : 'text-[var(--slate-ghost)] hover:text-[var(--silver-mist)]'
              }`
            }
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center">
              <HelpCircle size={17} />
            </div>
            <span>使用说明</span>
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6 overflow-auto" style={{ position: 'relative', zIndex: 5 }}>
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-14 z-50"
        style={{
          background: 'rgba(5, 5, 9, 0.92)',
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
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-[var(--ember-glow)]' : 'text-[var(--slate-ghost)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                  style={{
                    background: isActive ? 'var(--ember-soft)' : 'transparent',
                    boxShadow: isActive ? '0 0 10px rgba(232, 148, 26, 0.2)' : 'none',
                  }}
                >
                  <item.icon size={17} />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
              isActive ? 'text-[var(--ember-glow)]' : 'text-[var(--slate-ghost)]'
            }`
          }
        >
          <div className="w-7 h-7 rounded-md flex items-center justify-center">
            <Settings size={17} />
          </div>
          <span>设置</span>
        </NavLink>
      </nav>
    </div>
  )
}
