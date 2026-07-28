import { useEffect, useState } from 'react';
import { getTradeHistory, getTradeStats } from '../services/api';
import TradeTable from '../components/TradeTable';
import StatTile from '../components/StatTile';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTradeHistory({ limit: 100 }), getTradeStats()])
      .then(([t, s]) => {
        setTrades(t);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
      <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Trade history
      </h1>

      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="Total trades" value={stats.totalTrades} />
          <StatTile label="Win rate" value={`${stats.winRate}%`} />
          <StatTile label="Current streak" value={`${stats.currentStreak.count} ${stats.currentStreak.type || ''}`} />
          <StatTile label="Total P&L" value={stats.totalPnl.toFixed(2)} deltaGood={stats.totalPnl >= 0} />
        </section>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      ) : (
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <TradeTable trades={trades} />
        </div>
      )}
    </div>
  );
}
