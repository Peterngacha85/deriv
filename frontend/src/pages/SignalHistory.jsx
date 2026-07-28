import { useEffect, useState } from 'react';
import { getSignalHistory } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const TYPE_STATUS = { BUY: 'good', SELL: 'critical', HOLD: 'neutral' };

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SignalHistory() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSignalHistory({ limit: 100 })
      .then(setSignals)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Signal history
      </h1>
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      ) : (
        <div className="rounded-xl overflow-x-auto" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-sm tabular">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="font-normal py-2 px-4">Time</th>
                <th className="font-normal py-2 px-4">Symbol</th>
                <th className="font-normal py-2 px-4">Type</th>
                <th className="font-normal py-2 px-4">Confidence</th>
                <th className="font-normal py-2 px-4">Price</th>
                <th className="font-normal py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                    {formatTime(s.timestamp)}
                  </td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>
                    {s.symbol}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge status={TYPE_STATUS[s.type] || 'neutral'} label={s.type} />
                  </td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                    {s.confidence}%
                  </td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                    {s.priceAtSignal}
                  </td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
