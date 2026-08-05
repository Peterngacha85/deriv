/** Feature 8 — what kind of market this is, and what else is available. */
export default function MarketTypeCard({ symbol, symbols }) {
  const others = (symbols || []).filter((s) => s !== symbol);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2.5"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--series-orange)' }}
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Market type
      </span>
      <div className="flex flex-col gap-1 text-sm">
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Current: </span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {symbol}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Type: </span>
          <span style={{ color: 'var(--text-primary)' }}>Synthetic Index (Volatility)</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Trading hours: </span>
          <span style={{ color: 'var(--status-good)' }}>24/7 — not affected by news events</span>
        </div>
      </div>
      {others.length > 0 && (
        <div className="pt-2 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
            Other markets tracked:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {others.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
