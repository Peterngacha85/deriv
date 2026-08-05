import StatusBadge from './StatusBadge';

/** Feature 7 — current digit, next-digit probability, and confidence combined into one setup card. */
export default function TradeSetupCard({ digits, signal, symbol }) {
  if (!digits || !digits.lastDigits || digits.lastDigits.length === 0) {
    return (
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Waiting for digit data…
        </span>
      </div>
    );
  }

  const digit = digits.lastDigits[digits.lastDigits.length - 1];
  const threshold = digits.threshold ?? 5;
  const overPct = Math.round(digits.overUnder?.overPercentage ?? 50);
  const underPct = Math.round(digits.overUnder?.underPercentage ?? 50);
  const pickOver = overPct >= underPct;
  const confidence = signal?.confidence ?? Math.max(overPct, underPct);
  const ready = signal && signal.type !== 'HOLD';

  return (
    <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Your trade setup — {symbol}
        </span>
        <StatusBadge status={ready ? 'good' : 'neutral'} label={ready ? 'Ready' : 'Not ready'} />
      </div>

      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: '64px', height: '64px', background: 'var(--series-orange)' }}
        >
          <span className="font-bold" style={{ fontSize: '26px', color: '#fff' }}>
            {digit}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Current digit &middot; next digit prediction
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Most likely: {pickOver ? `over ${threshold}` : `under ${threshold}`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: pickOver ? 'var(--status-good)' : 'var(--text-secondary)' }}>
            Over {threshold}: {overPct}% {pickOver && '✅ pick this'}
          </span>
          <span style={{ color: !pickOver ? 'var(--status-good)' : 'var(--text-secondary)' }}>
            Under {threshold}: {underPct}% {!pickOver && '✅ pick this'}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: 'var(--meter-track)' }}>
          <div style={{ width: `${overPct}%`, background: 'var(--status-good)' }} />
          <div style={{ width: `${underPct}%`, background: 'var(--status-critical)' }} />
        </div>
      </div>

      <div className="text-sm pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
        Overall confidence: <b>{confidence}%</b>{' '}
        <span style={{ color: ready ? 'var(--status-good)' : 'var(--text-muted)' }}>
          {ready ? '✅ ready to consider' : '— below the threshold to act on'}
        </span>
      </div>
    </div>
  );
}
