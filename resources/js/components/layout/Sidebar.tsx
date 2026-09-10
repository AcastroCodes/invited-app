import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Palette,
  Users,
  UtensilsCrossed,
  Table2,
  Wallet,
  Building2,
  UserCog,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../theme/ThemeProvider';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

const globalNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: CalendarDays },
];

const bottomNavItems = [
  { to: '/credits', label: 'Credits', icon: Wallet },
  { to: '/partners', label: 'Partners', icon: Building2 },
  { to: '/users', label: 'Users', icon: UserCog },
];

export default function Sidebar({ open, onClose, isCollapsed = false }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const coralAccent = '#E07A5F';

  const pathParts = location.pathname.split('/');
  const isEventContext = pathParts[1] === 'events' && pathParts.length >= 3 && pathParts[2] !== 'new';
  const eventId = isEventContext ? pathParts[2] : null;

  const eventNavItems = [
    { to: '/events', label: '← All Events', icon: CalendarDays },
    { to: `/events/${eventId}/edit`, label: 'Event Details', icon: CalendarDays },
    { to: `/events/${eventId}/guests`, label: 'Guests', icon: Users },
    { to: `/events/${eventId}/tables`, label: 'Seating Plan', icon: Table2 },
    { to: `/events/${eventId}/menu`, label: 'Menu', icon: UtensilsCrossed },
  ];

  const activeNavItems = isEventContext ? eventNavItems : globalNavItems;

  const renderNavItem = (item: { to: string; label: string; icon: React.ComponentType<{ size?: number }> }) => {
    const Icon = item.icon;
    const isActive =
      location.pathname.startsWith(item.to) ||
      (item.to === '/dashboard' && location.pathname === '/');
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
        style={{
          borderRadius: isActive ? 0 : undefined,
          borderLeft: isActive ? `3px solid var(--primary-accent)` : '3px solid transparent',
          backgroundColor: isActive ? 'var(--primary-accent-light)' : 'transparent',
          color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : '#F6F7FB';
            e.currentTarget.style.color = 'var(--text-main)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        <div className="flex-shrink-0"><Icon size={20} /></div>
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: `1px solid var(--border-color)`,
        }}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center px-6 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: coralAccent }}
            >
              dI
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                dInvited
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 md:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto space-y-0.5 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Countdown widget */}
          {!isCollapsed && (
            <div
              className="rounded-2xl p-4 text-white mb-4"
              style={{ backgroundColor: 'var(--widget-timer-bg)' }}
            >
              <p className="text-xs font-medium opacity-90 mb-2">Próximo Evento</p>
              <div className="flex gap-2">
                {[
                  { val: '12', label: 'Días' },
                  { val: '08', label: 'Horas' },
                  { val: '45', label: 'Min' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex-1 rounded-xl py-2 text-center"
                    style={{ backgroundColor: 'var(--widget-timer-box)' }}
                  >
                    <p className="text-lg font-bold">{item.val}</p>
                    <p className="text-[10px] opacity-80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeNavItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Bottom section */}
        <div style={{ borderTop: '1px solid var(--border-color)' }} className={`space-y-3 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Admin links */}
          <div className="space-y-0.5">
            {!isCollapsed && (
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Configuración
              </p>
            )}
            {bottomNavItems.map((item) => renderNavItem(item))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className={`flex items-center transition-colors ${isCollapsed ? 'justify-center w-full rounded-md py-1.5' : 'w-full justify-between rounded-md px-3 py-1.5 text-sm font-medium'}`}
            style={{
              backgroundColor: isCollapsed ? 'transparent' : (isDark ? '#2A273D' : '#EFEFF5'),
              color: 'var(--text-main)',
            }}
          >
            {isCollapsed ? (
              isDark ? <Sun size={20} style={{ color: coralAccent }} /> : <Moon size={20} style={{ color: coralAccent }} />
            ) : (
              <>
                <span className="flex items-center gap-2">
                  {isDark ? <Sun size={16} style={{ color: coralAccent }} /> : <Moon size={16} style={{ color: coralAccent }} />}
                  {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
                <div
                  className="h-5 w-9 rounded-full flex items-center px-0.5 transition-colors"
                  style={{ backgroundColor: isDark ? '#555' : coralAccent }}
                >
                  <div
                    className="h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: isDark ? 'translateX(0)' : 'translateX(16px)' }}
                  />
                </div>
              </>
            )}
          </button>

          {/* User */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-1 py-1'}`}>
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: coralAccent }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user?.email || '—'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
