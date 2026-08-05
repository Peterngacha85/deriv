function buildChecks(signal, volatility) {
  const checks = [];
  if (!signal) return checks;

  checks.push({
    label: `Direction: ${signal.directionLabel || (signal.type === 'BUY' ? 'up' : 'down')}`,
    match: signal.type !== 'HOLD'
  });

  if (volatility) {
    checks.push({
      label: `Volatility: ${volatility.level} (${volatility.level === 'low' ? 'stable' : volatility.level === 'medium' ? 'some swings' : 'choppy'})`,
      match: volatility.level === 'low'
    });
  }

  const rsi = signal.indicators?.rsi;
  if (rsi !== undefined && rsi !== null) {
    const momentumUp = rsi > 50;
    checks.push({
      label: `Momentum: ${momentumUp ? 'leaning up' : 'leaning down'}`,
      match: (signal.type === 'BUY' && momentumUp) || (signal.type === 'SELL' && !momentumUp)
    });
  }

  return checks;
}

/** Feature 6 — shows which underlying indicators agree ("match") with the signal, in plain language. */
export default function SignalAnalysis({ signal, volatility }) {
  if (!signal) {
    return (
      <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No active signal to analyze right now.
        </span>
      </div>
    );
  }

  const checks = buildChecks(signal, volatility);
  const matchCount = checks.filter((c) => c.match).length;

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Signal check — {signal.symbol}
      </span>
      <div className="flex flex-col gap-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" style={{ color: c.match ? 'var(--status-good)' : 'var(--status-warning)' }}>
              {c.match ? '✅' : '⚠️'}
            </span>
            <span style={{ color: 'var(--text-primary)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div className="text-xs pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        {matchCount}/{checks.length} indicators agree &middot; overall confidence{' '}
        <b style={{ color: 'var(--text-primary)' }}>{signal.confidence}%</b>
      </div>
    </div>
  );
}
