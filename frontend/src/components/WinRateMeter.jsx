import Meter from './Meter';

export default function WinRateMeter({ winRate, totalTrades }) {
  const color = winRate >= 65 ? 'var(--status-good)' : winRate >= 50 ? 'var(--status-warning)' : 'var(--status-critical)';

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Win rate
      </span>
      <span className="font-semibold" style={{ fontSize: '48px', lineHeight: 1, color: 'var(--text-primary)' }}>
        {winRate}%
      </span>
      <Meter label={`${totalTrades} trades`} valuePct={winRate} displayValue="" color={color} />
    </div>
  );
}
