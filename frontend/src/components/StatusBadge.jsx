const STATUS_STYLES = {
  good: { color: 'var(--status-good)', icon: '▲' }, // ▲
  warning: { color: 'var(--status-warning)', icon: '●' }, // ●
  serious: { color: 'var(--status-serious)', icon: '●' },
  critical: { color: 'var(--status-critical)', icon: '▼' }, // ▼
  neutral: { color: 'var(--text-muted)', icon: '–' } // –
};

/** Status colors always ship with an icon + label — never color alone. */
export default function StatusBadge({ status = 'neutral', label }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.neutral;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: style.color, background: 'color-mix(in srgb, ' + style.color + ' 14%, transparent)' }}
    >
      <span aria-hidden="true">{style.icon}</span>
      {label}
    </span>
  );
}
