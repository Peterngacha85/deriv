import { useMarket } from '../context/MarketContext';
import { useNow } from '../hooks/useNow';

function elapsedLabel(sinceMs, now) {
  if (!sinceMs) return '—';
  const seconds = Math.max(0, Math.round((now - sinceMs) / 1000));
  if (seconds < 1) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

function StatusDot({ good, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
      <span
        aria-hidden="true"
        className="inline-block rounded-full shrink-0"
        style={{ width: '9px', height: '9px', background: good ? 'var(--status-good)' : 'var(--status-critical)' }}
      />
      {label}
    </span>
  );
}

/** Feature 11 (live data connection) + feature 10 (stop/refresh/reset controls), grouped as one top strip. */
export default function StatusBar() {
  const { snapshot, paused, togglePause, refreshNow, reset, lastUpdated } = useMarket();
  const connection = snapshot?.connection || {};
  const now = useNow(1000);
  const elapsed = elapsedLabel(lastUpdated, now);

  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <StatusDot good={connection.marketDataConnected} label="Market data live" />
        <StatusDot good={connection.accountConnected} label="Account connected" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Last update: {paused ? 'paused' : elapsed}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            color: paused ? 'var(--status-warning)' : 'var(--status-good)',
            background: `color-mix(in srgb, ${paused ? 'var(--status-warning)' : 'var(--status-good)'} 14%, transparent)`
          }}
        >
          {paused ? '⏸ Analysis paused' : '🟢 Analysis running'}
        </span>
        <button
          onClick={togglePause}
          title={paused ? 'Resume scanning markets for new signals' : 'Pause live scanning'}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={refreshNow}
          title="Fetch the latest data right now"
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Refresh
        </button>
        <button
          onClick={reset}
          title="Clear alerts, resume scanning, and pull fresh data"
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{ background: 'var(--brand)', color: '#fff' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
