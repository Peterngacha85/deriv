import { useMarket } from '../context/MarketContext';
import StatusBadge from './StatusBadge';

function maskAccountId(id) {
  if (!id) return '—';
  return id.length <= 4 ? id : `${id.slice(0, 2)}••••${id.slice(-2)}`;
}

/** Feature 12 — Deriv connection detail. Advanced/reference info, so it lives collapsed by default. */
export default function DerivConnector() {
  const { snapshot, refreshNow, lastUpdated, latencyMs } = useMarket();
  const connection = snapshot?.connection || {};
  const account = snapshot?.account;
  const balance = snapshot?.balance;

  const rows = [
    { label: 'Market data stream', value: connection.marketDataConnected ? 'Streaming' : 'Offline', good: connection.marketDataConnected },
    { label: 'Trading account', value: connection.accountConnected ? 'Connected' : 'Not connected', good: connection.accountConnected },
    { label: 'Account ID', value: maskAccountId(account?.account_id), plain: true },
    { label: 'Account type', value: account?.account_type ? account.account_type.toUpperCase() : '—', plain: true },
    { label: 'Balance', value: balance ? `${balance.balance.toFixed(2)} ${balance.currency}` : '—', plain: true },
    { label: 'Response time', value: latencyMs !== null ? `${latencyMs}ms` : '—', plain: true }
  ];

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Deriv connection
        </span>
        {connection.accountConnected && connection.marketDataConnected ? (
          <StatusBadge status="good" label="All good" />
        ) : (
          <StatusBadge status="critical" label="Check connection" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs tabular">
        {rows.map((row) => (
          <div key={row.label}>
            <div style={{ color: 'var(--text-muted)' }}>{row.label}</div>
            <div className="font-medium" style={{ color: row.plain ? 'var(--text-primary)' : row.good ? 'var(--status-good)' : 'var(--status-critical)' }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <span>Last checked {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</span>
        <button
          onClick={refreshNow}
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          Check now
        </button>
      </div>
    </div>
  );
}
