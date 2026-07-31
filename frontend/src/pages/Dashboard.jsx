import { useEffect, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { getChart, getDigits, getSettings } from '../services/api';
import StatTile from '../components/StatTile';
import SignalCard from '../components/SignalCard';
import VolatilityCard from '../components/VolatilityCard';
import WinRateMeter from '../components/WinRateMeter';
import DigitChart from '../components/DigitChart';
import DigitFace from '../components/DigitFace';
import PriceChart from '../components/PriceChart';
import TradeTable from '../components/TradeTable';
import FeaturedTrade from '../components/FeaturedTrade';

const CHART_POLL_MS = 15000;
const MIN_TRADES_FOR_WIN_RATE = 3;

export default function Dashboard() {
  const { snapshot, loading, error } = useMarket();
  const symbols = snapshot?.symbols || [];
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [candles, setCandles] = useState([]);
  const [digits, setDigits] = useState(null);
  const [riskPercentage, setRiskPercentage] = useState(null);

  useEffect(() => {
    getSettings()
      .then((s) => setRiskPercentage(s.riskPercentage))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSymbol && symbols.length > 0) setSelectedSymbol(symbols[0]);
  }, [symbols, selectedSymbol]);

  useEffect(() => {
    if (!selectedSymbol) return undefined;
    let cancelled = false;

    async function poll() {
      try {
        const [chartData, digitData] = await Promise.all([getChart(selectedSymbol, 100), getDigits(selectedSymbol)]);
        if (!cancelled) {
          setCandles(chartData);
          setDigits(digitData);
        }
      } catch {
        // transient — next poll will retry
      }
    }

    poll();
    const timer = setInterval(poll, CHART_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedSymbol]);

  if (loading) {
    return (
      <div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading dashboard…
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="p-8 text-sm" style={{ color: 'var(--status-critical)' }}>
        Could not reach the backend: {error}
      </div>
    );
  }

  const { signals = [], volatility = [], tradeStats, recentTrades = [], balance } = snapshot || {};

  const topSignal = [...signals]
    .filter((s) => s.type !== 'HOLD')
    .sort((a, b) => b.confidence - a.confidence)[0] || null;

  const MIN_SENSIBLE_STAKE = 0.5; // below this, "recommended stake" isn't actionable — flag it instead
  let stake = null;
  let stakeTooLow = false;
  if (topSignal && balance?.balance !== undefined && riskPercentage !== null) {
    const computed = Math.round(((balance.balance * riskPercentage) / 100) * 100) / 100;
    if (computed < MIN_SENSIBLE_STAKE) {
      stakeTooLow = true;
    } else {
      stake = computed;
    }
  }

  const topSignalVolatility = topSignal ? volatility.find((v) => v.symbol === topSignal.symbol) : null;

  let topSignalWinRate = null;
  if (topSignal) {
    const symbolTrades = recentTrades.filter((t) => t.symbol === topSignal.symbol);
    if (symbolTrades.length >= MIN_TRADES_FOR_WIN_RATE) {
      const wins = symbolTrades.filter((t) => t.result === 'WON').length;
      topSignalWinRate = {
        wins,
        total: symbolTrades.length,
        rate: Math.round((wins / symbolTrades.length) * 1000) / 10
      };
    }
  }

  return (
    <div className="p-6 flex flex-col gap-8 max-w-6xl mx-auto w-full">
      {error && (
        <div
          className="text-sm rounded-lg px-3 py-2.5"
          style={{ color: 'var(--status-warning)', background: 'color-mix(in srgb, var(--status-warning) 10%, transparent)' }}
        >
          Having trouble reaching the backend — showing the last known data. Retrying…
        </div>
      )}

      <FeaturedTrade
        signal={topSignal}
        stake={stake}
        stakeTooLow={stakeTooLow}
        winRate={topSignalWinRate}
        volatility={topSignalVolatility}
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Symbols tracked" value={symbols.length} icon="🌐" iconColor="var(--series-blue)" />
        <StatTile label="Total trades" value={tradeStats?.totalTrades ?? 0} icon="🔁" iconColor="var(--series-violet)" />
        <StatTile
          label="Total P&L"
          value={`${tradeStats?.totalPnl?.toFixed?.(2) ?? '0.00'}`}
          delta={tradeStats?.totalPnl !== undefined ? `${tradeStats.totalPnl >= 0 ? '+' : ''}${tradeStats.totalPnl.toFixed(2)}` : undefined}
          deltaGood={tradeStats?.totalPnl >= 0}
          icon="💰"
          iconColor={tradeStats?.totalPnl >= 0 ? 'var(--status-good)' : 'var(--status-critical)'}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Live chart
          </h2>
          <div className="flex gap-1">
            {symbols.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSymbol(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: s === selectedSymbol ? 'var(--brand)' : 'transparent',
                  color: s === selectedSymbol ? '#fff' : 'var(--text-secondary)',
                  border: s === selectedSymbol ? '1px solid var(--brand)' : '1px solid var(--border)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="card-hover rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <PriceChart candles={candles} symbol={selectedSymbol} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          All markets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((s) => (
            <SignalCard key={s.symbol} signal={s} featured={topSignal?.symbol === s.symbol} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Volatility
          </h2>
          {volatility.map((v) => (
            <VolatilityCard key={v.symbol} snapshot={v} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Win rate
          </h2>
          <WinRateMeter winRate={tradeStats?.winRate ?? 0} totalTrades={tradeStats?.totalTrades ?? 0} />
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Digit analysis — {selectedSymbol}
          </h2>
          <div className="card-hover rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <DigitFace analysis={digits} symbol={selectedSymbol} />
            <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <DigitChart analysis={digits} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Recent trades
        </h2>
        <div className="card-hover rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <TradeTable trades={recentTrades} />
        </div>
      </section>
    </div>
  );
}
