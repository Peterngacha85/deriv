export default function ConnectionBadge({ connected, label }) {
  const color = connected ? 'var(--status-good)' : 'var(--status-critical)';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      style={{ color: 'var(--text-secondary)' }}
      title={`${label}: ${connected ? 'connected' : 'offline'}`}
    >
      <span
        aria-hidden="true"
        className="inline-block rounded-full shrink-0"
        style={{ width: '8px', height: '8px', background: color }}
      />
      <span className="hidden sm:inline">
        {label}: {connected ? 'connected' : 'offline'}
      </span>
    </span>
  );
}
