import { useEffect } from 'react';
import { useMarket } from '../context/MarketContext';

const AUTO_DISMISS_MS = 8000;

const LEVEL_STYLES = {
  good: { color: 'var(--status-good)', icon: '▲' },
  critical: { color: 'var(--status-critical)', icon: '▼' },
  warning: { color: 'var(--status-warning)', icon: '●' }
};

function Toast({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  const style = LEVEL_STYLES[alert.level] || LEVEL_STYLES.warning;

  return (
    <div
      role="alert"
      className="rounded-lg p-3 pr-8 relative flex items-start gap-2.5 w-full sm:w-80"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <span aria-hidden="true" className="text-sm mt-0.5" style={{ color: style.color }}>
        {style.icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {alert.title}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {alert.message}
        </span>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss"
        className="absolute top-2 right-2 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        ✕
      </button>
    </div>
  );
}

export default function NotificationCenter() {
  const { alerts, dismissAlert } = useMarket();

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2" aria-live="polite">
      {alerts.slice(0, 5).map((alert) => (
        <Toast key={alert.id} alert={alert} onDismiss={dismissAlert} />
      ))}
    </div>
  );
}
