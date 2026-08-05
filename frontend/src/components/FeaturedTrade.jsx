import StatusBadge from './StatusBadge';

const TYPE_LABEL = { BUY: 'Rise', SELL: 'Fall' };
const TYPE_STATUS = { BUY: 'good', SELL: 'critical' };

const ACCENT = {
  BUY: { border: 'var(--status-good)', wash: 'color-mix(in srgb, var(--status-good) 8%, var(--surface-1))' },
  SELL: { border: 'var(--status-critical)', wash: 'color-mix(in srgb, var(--status-critical) 8%, var(--surface-1))' }
};

function formatPrice(value) {
  if (value === undefined || value === null) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function FeaturedTrade({ signal, stake, stakeTooLow, winRate, volatility }) {
  if (!signal) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="text-sm font-medium">No high-confidence opportunity right now</div>
        <div className="text-xs mt-1">Every market is on HOLD. Check back shortly, or review all markets below.</div>
      </div>
    );
  }

  const { symbol, type, confidence, priceAtSignal, stopLoss, takeProfit, directionLabel, indicators } = signal;
  const accent = ACCENT[type];
  const action = TYPE_LABEL[type];

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style={{ background: accent.wash, border: '1px solid var(--border)', borderLeft: `6px solid ${accent.border}`, boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          🎯 Best opportunity right now
        </span>
        <StatusBadge status={TYPE_STATUS[type]} label={`${confidence}% confidence`} />
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {symbol}
        </span>
        <span className="text-xl sm:text-2xl font-bold" style={{ color: accent.border }}>
          {action}
        </span>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          What to do — step by step
        </div>
        <ol className="flex flex-col gap-2.5 text-base" style={{ color: 'var(--text-primary)' }}>
          <li>
            1. Go to Deriv &rarr; <b>{symbol}</b>
          </li>
          <li>
            2. Trade type: <b>Rise/Fall</b> (or Multipliers)
          </li>
          <li>
            3. Direction: <b>{action}</b>
          </li>
          <li>
            4. Stake:{' '}
            {stakeTooLow ? (
              <span style={{ color: 'var(--status-warning)' }}>
                Balance too low for a meaningful stake at your current risk %
              </span>
            ) : (
              <>
                <b>{stake !== null ? `${stake} USD` : '—'}</b>
                {stake !== null && <span style={{ color: 'var(--text-muted)' }}> (based on your risk setting)</span>}
              </>
            )}
          </li>
          <li>
            5. Suggested exit &mdash; target <b>{formatPrice(takeProfit)}</b>, cut loss near <b>{formatPrice(stopLoss)}</b>
          </li>
          <li>
            6. Click <b>Buy</b>
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Current price</div>
          <div className="tabular font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(priceAtSignal)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Direction</div>
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {directionLabel}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>RSI</div>
          <div className="tabular font-medium" style={{ color: 'var(--text-primary)' }}>
            {indicators?.rsi?.toFixed(1) ?? '—'}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Volatility</div>
          <div className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
            {volatility?.level ?? '—'}
          </div>
        </div>
      </div>

      {winRate && (
        <div className="text-xs pt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Recent performance on {symbol}:{' '}
          <b style={{ color: 'var(--text-primary)' }}>
            {winRate.rate}% won
          </b>{' '}
          ({winRate.wins}/{winRate.total} last trades)
        </div>
      )}
    </div>
  );
}
