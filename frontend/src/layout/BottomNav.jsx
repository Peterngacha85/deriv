import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/signals', label: 'Signals' },
  { to: '/trades', label: 'Trades' },
  { to: '/backtest', label: 'Backtest' },
  { to: '/settings', label: 'Settings' }
];

/** Mobile-only bottom tab bar — replaces the fixed sidebar below the md breakpoint. */
export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className="flex-1 py-2.5 text-center text-xs font-medium"
          style={({ isActive }) => ({ color: isActive ? 'var(--brand)' : 'var(--text-secondary)' })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
