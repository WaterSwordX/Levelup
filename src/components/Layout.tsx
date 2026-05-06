import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FolderTree, PenLine, Timer, BarChart3, HelpCircle, Zap, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '看板' },
  { to: '/categories', icon: FolderTree, label: '分类' },
  { to: '/record', icon: PenLine, label: '记录' },
  { to: '/focus', icon: Timer, label: '专注' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 电脑端侧边栏 */}
      <nav className="hidden md:flex flex-col w-60 shrink-0 p-3 gap-1"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 px-3 pt-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #e8941a)',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <Zap size={18} className="text-[#0e1017]" />
          </div>
          <div>
            <h1
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
            >
              Levelup
            </h1>
            <p className="text-[10px] tracking-wide" style={{ color: 'var(--text-muted)' }}>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-in ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isActive
                        ? 'var(--accent-soft)'
                        : 'transparent',
                    }}
                  >
                    <item.icon size={18} />
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-auto pt-4 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
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
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <HelpCircle size={18} />
            </div>
            <span>使用说明</span>
          </NavLink>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 pb-24 md:pb-6 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* 手机端底部导航 */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50"
        style={{
          background: 'rgba(14, 16, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
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
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
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
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
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
  )
}
