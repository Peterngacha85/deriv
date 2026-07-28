export default function ConnectionBadge({ connected, label }) {
  const color = connected ? 'var(--status-good)' : 'var(--status-critical)';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
      <span
        aria-hidden="true"
        className="inline-block rounded-full"
        style={{ width: '8px', height: '8px', background: color }}
      />
      {label}: {connected ? 'connected' : 'offline'}
    </span>
  );
}
