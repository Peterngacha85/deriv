/** Feature 3 — matches signal scanner: which digit shows up most in the recent stream. */
export default function PatternScanner({ digits, symbol }) {
  if (!digits || !digits.frequency) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--series-aqua)' }}
      >
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Waiting for digit data…
        </span>
      </div>
    );
  }

  const { lastDigits = [], frequency, matches } = digits;
  const top = [...frequency].sort((a, b) => b.count - a.count).slice(0, 3).filter((d) => d.count > 0);
  const leader = top[0];

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--series-aqua)' }}
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Pattern matches — {symbol}
      </span>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
          Last digits:
        </span>
        {lastDigits.slice(-8).map((d, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center rounded-full text-xs font-semibold tabular"
            style={{ width: '22px', height: '22px', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {top.map(({ digit, count, percentage }) => (
          <div key={digit} className="flex items-center gap-2 text-sm">
            <span className="tabular font-medium" style={{ color: 'var(--text-primary)', width: '2ch' }}>
              {digit}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--meter-track)' }}>
              <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: 'var(--series-blue)' }} />
            </div>
            <span className="text-xs tabular w-16 text-right" style={{ color: 'var(--text-muted)' }}>
              {count}× ({percentage}%)
            </span>
          </div>
        ))}
      </div>

      {leader && (
        <div className="text-sm pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          Next digit likely: <b>{leader.digit}</b>{' '}
          <span style={{ color: 'var(--text-muted)' }}>({leader.percentage}% of recent ticks)</span>
        </div>
      )}
      {matches && (
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Repeating-digit strength: {matches.percentage}%
        </div>
      )}
    </div>
  );
}
