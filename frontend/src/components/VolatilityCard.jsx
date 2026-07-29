import StatusBadge from './StatusBadge';

const LEVEL_STATUS = { low: 'good', medium: 'warning', high: 'critical' };
const TREND_ARROW = { increasing: '↑', decreasing: '↓', stable: '→' };

const ACCENT = {
  low: { border: 'var(--status-good)', wash: 'color-mix(in srgb, var(--status-good) 6%, var(--surface-1))' },
  medium: { border: 'var(--status-warning)', wash: 'color-mix(in srgb, var(--status-warning) 8%, var(--surface-1))' },
  high: { border: 'var(--status-critical)', wash: 'color-mix(in srgb, var(--status-critical) 6%, var(--surface-1))' }
};

export default function VolatilityCard({ snapshot }) {
  if (!snapshot) return null;
  const { symbol, level, trend, atrPct } = snapshot;
  const accent = ACCENT[level] || { border: 'var(--border)', wash: 'var(--surface-1)' };

  return (
    <div
      className="rounded-xl p-3 flex items-center justify-between"
      style={{
        background: accent.wash,
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${accent.border}`,
        boxShadow: 'var(--shadow-card)'
      }}
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
