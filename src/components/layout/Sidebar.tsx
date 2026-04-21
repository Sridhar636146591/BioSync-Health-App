import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PenSquare, Lightbulb, CalendarDays, Activity, Users, Box, Brain, User, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log', icon: PenSquare, label: 'Log Entry' },
  { to: '/predictions', icon: Brain, label: 'AI Predictions' },
  { to: '/body', icon: Box, label: '3D Body' },
  { to: '/diet', icon: UtensilsCrossed, label: 'Diet Plans' },
  { to: '/squad', icon: Users, label: 'Squad' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/history', icon: CalendarDays, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-screen overflow-y-auto flex-shrink-0 p-6 gap-8 sticky top-0">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">BioSync</span>
      </div>

      <nav className="flex flex-col gap-1 flex-shrink-0">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-elegant'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex-shrink-0">
        <div className="rounded-xl gradient-card-teal p-4 border border-teal/10">
          <p className="text-sm font-medium text-foreground">Track consistently</p>
          <p className="text-xs text-muted-foreground mt-1">
            Log your habits daily for the best insights and pattern detection.
          </p>
        </div>
      </div>
    </aside>
  )
}
