/**
 * Stat tile: label + value + optional delta, per the dataviz skill's figure contract.
 */
export default function StatTile({ label, value, delta, deltaGood, sublabel }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      {(delta !== undefined || sublabel) && (
        <span
          className="text-xs tabular"
          style={{ color: delta !== undefined ? (deltaGood ? 'var(--status-good)' : 'var(--status-critical)') : 'var(--text-muted)' }}
        >
          {delta !== undefined ? delta : sublabel}
        </span>
      )}
    </div>
  );
}
