import ConnectionBadge from '../components/ConnectionBadge';
import { useMarket } from '../context/MarketContext';
import { useDesktopNotifications } from '../hooks/useDesktopNotifications';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { snapshot } = useMarket();
  const connection = snapshot?.connection || {};
  const balance = snapshot?.balance;
  const desktopNotify = useDesktopNotifications();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-3 gap-2"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}
    >
      <div className="flex items-center gap-2.5 shrink-0">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center rounded-lg font-bold text-sm shrink-0"
          style={{ width: '30px', height: '30px', background: 'var(--brand)', color: '#fff' }}
        >
          B
        </span>
        <span className="font-semibold text-base sm:text-lg tracking-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
          D'auto Traders
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <ConnectionBadge connected={connection.marketDataConnected} label="Market data" />
        <ConnectionBadge connected={connection.accountConnected} label="Account" />
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-sm shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {desktopNotify.supported && (
          <button
            onClick={desktopNotify.toggle}
            title={desktopNotify.enabled ? 'Desktop notifications on' : 'Enable desktop notifications'}
            aria-pressed={desktopNotify.enabled}
            className="text-sm shrink-0"
            style={{ color: desktopNotify.enabled ? 'var(--brand)' : 'var(--text-muted)' }}
          >
            {desktopNotify.enabled ? '🔔' : '🔕'}
          </button>
        )}
        {balance && (
          <span
            className="text-xs sm:text-sm font-semibold tabular px-2.5 sm:px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
            style={{ color: '#fff', background: 'var(--brand)' }}
          >
            {balance.balance.toFixed(2)} {balance.currency}
          </span>
        )}
      </div>
    </header>
  );
}
