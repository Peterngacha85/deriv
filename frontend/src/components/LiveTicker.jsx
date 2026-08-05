import { useNow } from '../hooks/useNow';

function formatPrice(value) {
  if (value === undefined || value === null) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function secondsAgo(iso, now) {
  if (!iso) return null;
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
}

/** Feature 4 — live tick streamer: a scrolling strip of the latest price per market. */
export default function LiveTicker({ signals }) {
  const now = useNow(1000);

  if (!signals || signals.length === 0) return null;

  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: 'var(--status-good)' }}>
        <span aria-hidden="true" className="inline-block rounded-full" style={{ width: '7px', height: '7px', background: 'var(--status-good)' }} />
        LIVE PRICES
      </span>
      {signals.map((s) => {
        const age = secondsAgo(s.timestamp, now);
        return (
          <div key={s.symbol} className="flex items-baseline gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {s.symbol}
            </span>
            <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
              {formatPrice(s.priceAtSignal)}
            </span>
            <span className="text-xs tabular" style={{ color: 'var(--text-muted)' }}>
              {age === null ? '' : `${age}s ago`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
