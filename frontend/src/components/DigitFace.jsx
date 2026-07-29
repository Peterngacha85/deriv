/** A big, friendly live-digit display — the current last-digit of price, at a glance. */
export default function DigitFace({ analysis, symbol }) {
  if (!analysis || !analysis.lastDigits || analysis.lastDigits.length === 0) return null;

  const digit = analysis.lastDigits[analysis.lastDigits.length - 1];
  const threshold = analysis.threshold ?? 5;
  const isOver = digit > threshold;
  const isUnder = digit < threshold;
  const overUnderLabel = isOver ? 'OVER' : isUnder ? 'UNDER' : 'EQUAL';
  const overUnderColor = isOver ? 'var(--status-good)' : isUnder ? 'var(--status-critical)' : 'var(--text-muted)';
  const isEven = digit % 2 === 0;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: '120px', height: '120px', background: 'var(--series-orange)' }}
      >
        <span className="font-bold" style={{ fontSize: '48px', color: '#fff', lineHeight: 1 }}>
          {digit}
        </span>
      </div>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {symbol} &middot; last digit
      </span>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color: overUnderColor, background: 'color-mix(in srgb, ' + overUnderColor + ' 14%, transparent)' }}
        >
          <span aria-hidden="true">{isOver ? '▲' : isUnder ? '▼' : '●'}</span>
          {overUnderLabel} {threshold}
        </span>
        <span
          className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)' }}
        >
          {isEven ? 'EVEN' : 'ODD'}
        </span>
      </div>
    </div>
  );
}
