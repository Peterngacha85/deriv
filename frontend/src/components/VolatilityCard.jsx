import StatusBadge from './StatusBadge';

const LEVEL_STATUS = { low: 'good', medium: 'warning', high: 'critical' };
const TREND_ARROW = { increasing: '↑', decreasing: '↓', stable: '→' };

export default function VolatilityCard({ snapshot }) {
  if (!snapshot) return null;
  const { symbol, level, trend, atrPct } = snapshot;

  return (
    <div
      className="rounded-xl p-3 flex items-center justify-between"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {symbol}
        </span>
        <span className="text-xs tabular" style={{ color: 'var(--text-muted)' }}>
          ATR {(atrPct * 100).toFixed(2)}% {TREND_ARROW[trend] || ''} {trend}
        </span>
      </div>
      <StatusBadge status={LEVEL_STATUS[level] || 'neutral'} label={level} />
    </div>
  );
}
