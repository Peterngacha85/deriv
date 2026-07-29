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
          <StatTile label="Total trades" value={stats.totalTrades} icon="🔁" iconColor="var(--series-violet)" />
          <StatTile label="Win rate" value={`${stats.winRate}%`} icon="🎯" iconColor="var(--series-blue)" />
          <StatTile
            label="Current streak"
            value={`${stats.currentStreak.count} ${stats.currentStreak.type || ''}`}
            icon={stats.currentStreak.type === 'WON' ? '🔥' : '❄️'}
            iconColor={stats.currentStreak.type === 'WON' ? 'var(--status-good)' : 'var(--status-critical)'}
          />
          <StatTile
            label="Total P&L"
            value={stats.totalPnl.toFixed(2)}
            deltaGood={stats.totalPnl >= 0}
            icon="💰"
            iconColor={stats.totalPnl >= 0 ? 'var(--status-good)' : 'var(--status-critical)'}
          />
        </section>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      ) : (
        <div className="card-hover rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <TradeTable trades={trades} />
        </div>
      )}
    </div>
  );
}
