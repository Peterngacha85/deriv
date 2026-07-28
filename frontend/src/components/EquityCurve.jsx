/** Simple single-series line chart of cumulative P&L across a backtest run — no legend needed for one series. */
export default function EquityCurve({ trades }) {
  if (!trades || trades.length === 0) return null;

  const width = 600;
  const height = 160;
  const padding = 8;

  let running = 0;
  const points = trades.map((t) => (running += t.pnl));
  const min = Math.min(0, ...points);
  const max = Math.max(0, ...points);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = padding + (i / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const zeroY = height - padding - ((0 - min) / range) * (height - padding * 2);
  const finalColor = points[points.length - 1] >= 0 ? 'var(--status-good)' : 'var(--status-critical)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Cumulative P&L across the backtest">
      <line x1={padding} x2={width - padding} y1={zeroY} y2={zeroY} stroke="var(--baseline)" strokeWidth="1" />
      <path d={path} fill="none" stroke={finalColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
