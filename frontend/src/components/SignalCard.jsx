import Meter from './Meter';
import StatusBadge from './StatusBadge';

const TYPE_STATUS = { BUY: 'good', SELL: 'critical', HOLD: 'neutral' };

const ACCENT = {
  BUY: { border: 'var(--status-good)', wash: 'color-mix(in srgb, var(--status-good) 6%, var(--surface-1))' },
  SELL: { border: 'var(--status-critical)', wash: 'color-mix(in srgb, var(--status-critical) 6%, var(--surface-1))' },
  HOLD: { border: 'var(--border)', wash: 'var(--surface-1)' }
};

function formatPrice(value) {
  if (value === undefined || value === null) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function SignalCard({ signal, featured = false }) {
  if (!signal) return null;
  const { symbol, type, confidence, directionLabel, priceAtSignal, stopLoss, takeProfit, indicators } = signal;
  const accent = ACCENT[type] || ACCENT.HOLD;
  const isHold = type === 'HOLD';

  return (
    <div
      className="card-hover rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: accent.wash,
        border: featured ? '1px solid var(--brand)' : '1px solid var(--border)',
        borderLeft: `4px solid ${accent.border}`,
        opacity: isHold ? 0.7 : 1
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          {symbol}
          {featured && (
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={{ color: 'var(--brand)', background: 'color-mix(in srgb, var(--brand) 14%, transparent)' }}
            >
              Top pick
            </span>
          )}
        </span>
        <StatusBadge status={TYPE_STATUS[type] || 'neutral'} label={isHold ? 'Skip — HOLD' : type} />
      </div>

      <Meter label="Confidence" valuePct={confidence} displayValue={`${confidence}%`} color="var(--series-blue)" />

      <div className="grid grid-cols-3 gap-2 text-xs tabular">
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Price</div>
          <div style={{ color: 'var(--text-primary)' }}>{formatPrice(priceAtSignal)}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Stop loss</div>
          <div style={{ color: 'var(--text-primary)' }}>{formatPrice(stopLoss)}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Take profit</div>
          <div style={{ color: 'var(--text-primary)' }}>{formatPrice(takeProfit)}</div>
        </div>
      </div>

      {indicators && (
        <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <span>Direction: {directionLabel}</span>
          <span>RSI {indicators.rsi?.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}
