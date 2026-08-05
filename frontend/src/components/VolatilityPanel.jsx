import VolatilityCard from './VolatilityCard';
import StatusBadge from './StatusBadge';

function overallSummary(volatility) {
  if (!volatility || volatility.length === 0) return null;
  const highCount = volatility.filter((v) => v.level === 'high').length;
  const mediumCount = volatility.filter((v) => v.level === 'medium').length;
  if (highCount > 0) return { status: 'critical', label: `${highCount} market${highCount > 1 ? 's' : ''} risky right now` };
  if (mediumCount > 0) return { status: 'warning', label: `${mediumCount} market${mediumCount > 1 ? 's' : ''} need caution` };
  return { status: 'good', label: 'Market is stable' };
}

/** Feature 1 — volatility across every tracked market, plus a one-line overall read. */
export default function VolatilityPanel({ volatility }) {
  const summary = overallSummary(volatility);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Volatility status
        </span>
        {summary && <StatusBadge status={summary.status} label={summary.label} />}
      </div>
      <div className="flex flex-col gap-2">
        {(volatility || []).map((v) => (
          <VolatilityCard key={v.symbol} snapshot={v} />
        ))}
      </div>
    </div>
  );
}
