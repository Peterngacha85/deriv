/**
 * Stat tile: label + value + optional delta, per the dataviz skill's figure contract.
 */
export default function StatTile({ label, value, delta, deltaGood, sublabel, icon, iconColor = 'var(--brand)' }) {
  return (
    <div
      className="card-hover rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center rounded-full shrink-0"
            style={{ width: '30px', height: '30px', background: 'color-mix(in srgb, ' + iconColor + ' 16%, transparent)', fontSize: '15px' }}
          >
            {icon}
          </span>
        )}
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
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
