import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FolderTree, PenLine, Timer, BarChart3, HelpCircle } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '看板' },
  { to: '/categories', icon: FolderTree, label: '分类' },
  { to: '/record', icon: PenLine, label: '记录' },
  { to: '/focus', icon: Timer, label: '专注' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col md:flex-row">
      {/* 电脑端侧边栏 */}
      <nav className="hidden md:flex flex-col w-56 bg-[#161b22] border-r border-[#30363d] p-4 gap-1 shrink-0">
        <div className="flex items-center justify-between mb-5 px-2">
          <h1 className="text-lg font-bold text-white tracking-tight">Levelup</h1>
          <NavLink to="/guide" className="text-[#484f58] hover:text-[#8b949e] transition-colors">
            <HelpCircle size={18} />
          </NavLink>
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#58a6ff15] text-[#58a6ff] shadow-[inset_0_0_0_1px_rgba(88,166,255,0.2)]'
                  : 'text-[#8b949e] hover:bg-[#1c2128] hover:text-[#e6edf3]'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 pb-20 md:pb-4 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* 手机端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex justify-around items-center h-16 z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                isActive ? 'text-[#58a6ff]' : 'text-[#484f58]'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/guide"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
              isActive ? 'text-[#58a6ff]' : 'text-[#484f58]'
            }`
          }
        >
          <HelpCircle size={20} />
          帮助
        </NavLink>
      </nav>
    </div>
  )
}
