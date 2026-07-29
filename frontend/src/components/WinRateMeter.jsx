const SIZE = 140;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function WinRateMeter({ winRate, totalTrades }) {
  const color = winRate >= 65 ? 'var(--status-good)' : winRate >= 50 ? 'var(--status-warning)' : 'var(--status-critical)';
  const clamped = Math.max(0, Math.min(100, winRate));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      className="card-hover rounded-xl p-4 flex flex-col items-center gap-3"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <span className="text-xs self-start" style={{ color: 'var(--text-secondary)' }}>
        Win rate
      </span>
      <div className="relative" style={{ width: SIZE, height: SIZE }} role="img" aria-label={`Win rate ${winRate}% across ${totalTrades} trades`}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--meter-track)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-semibold tabular" style={{ fontSize: '30px', lineHeight: 1, color: 'var(--text-primary)' }}>
            {winRate}%
          </span>
          <span className="text-xs tabular" style={{ color: 'var(--text-muted)' }}>
            {totalTrades} trades
          </span>
        </div>
      </div>
    </div>
  );
}
