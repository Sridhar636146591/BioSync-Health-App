import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PenSquare, Brain, Box, Users, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/log', icon: PenSquare, label: 'Log' },
  { to: '/diet', icon: UtensilsCrossed, label: 'Diet' },
  { to: '/predictions', icon: Brain, label: 'AI' },
  { to: '/body', icon: Box, label: '3D' },
  { to: '/squad', icon: Users, label: 'Squad' },
]

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t px-2 py-1.5 flex justify-around items-center flex-shrink-0">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => cn(
            'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors',
            isActive
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
