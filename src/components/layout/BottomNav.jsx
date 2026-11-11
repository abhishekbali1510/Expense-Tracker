import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/add', label: 'Add', icon: '➕' },
  { to: '/history', label: 'History', icon: '📜' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

/**
 * Fixed bottom navigation bar.
 * Placeholder icons — will be replaced with a proper icon set.
 */
export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around
                 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm
                 pb-[var(--sab)] h-16"
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs transition-colors
             ${isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'}`
          }
        >
          <span className="text-xl">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
