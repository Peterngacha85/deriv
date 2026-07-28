/**
 * Meter / progress track — fill carries the value, the unfilled track is a
 * lighter step of the same ramp so state reads across the whole bar.
 */
export default function Meter({ label, valuePct, displayValue, color = 'var(--series-blue)', track = 'var(--meter-track)' }) {
  const clamped = Math.max(0, Math.min(100, valuePct));
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
          {displayValue}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  );
}
