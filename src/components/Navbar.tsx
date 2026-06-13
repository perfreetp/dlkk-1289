import { NavLink } from 'react-router-dom';
import { Compass, FileText, Briefcase, ListTodo, History } from 'lucide-react';
import { cn } from '@/utils/export';

const navItems = [
  { to: '/', label: '诊断问卷', icon: Compass },
  { to: '/report', label: '结果报告', icon: FileText },
  { to: '/jobs', label: '岗位库', icon: Briefcase },
  { to: '/action', label: '行动清单', icon: ListTodo },
  { to: '/history', label: '历史记录', icon: History },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-md border-b border-ink-100">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-ink-900 text-sun-400 flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Compass size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold text-ink-900">职业罗盘</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-700 hover:bg-ink-100'
                  )
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <nav className="md:hidden flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                    isActive
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-700 hover:bg-ink-100'
                  )
                }
              >
                <item.icon size={18} />
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
