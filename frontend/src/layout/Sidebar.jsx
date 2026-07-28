import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/signals', label: 'Signal history' },
  { to: '/trades', label: 'Trade history' },
  { to: '/backtest', label: 'Backtest' },
  { to: '/settings', label: 'Settings' }
];

export default function Sidebar() {
  return (
    <nav
      className="w-52 shrink-0 flex flex-col gap-1 p-4"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--surface-1)' }}
    >
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
            background: isActive ? 'var(--brand-wash)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
            paddingLeft: isActive ? '9px' : '12px'
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
