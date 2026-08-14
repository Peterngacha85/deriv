import { useEffect, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { getChart, getDigits, getSettings } from '../services/api';
import StatTile from '../components/StatTile';
import SignalCard from '../components/SignalCard';
import VolatilityPanel from '../components/VolatilityPanel';
import WinRateMeter from '../components/WinRateMeter';
import PriceChart from '../components/PriceChart';
import TradeTable from '../components/TradeTable';
import FeaturedTrade from '../components/FeaturedTrade';
import StatusBar from '../components/StatusBar';
import LiveTicker from '../components/LiveTicker';
import VolatilityIndexTracker from '../components/VolatilityIndexTracker';
import TradeSetupCard from '../components/TradeSetupCard';
import SignalAnalysis from '../components/SignalAnalysis';
import TradeTypeCard from '../components/TradeTypeCard';
import PatternScanner from '../components/PatternScanner';
import MarketTypeCard from '../components/MarketTypeCard';
import StrategySelector from '../components/StrategySelector';
import DerivConnector from '../components/DerivConnector';
import ExpandableSection from '../components/ExpandableSection';

const CHART_POLL_MS = 15000;
const MIN_TRADES_FOR_WIN_RATE = 3;
const STRATEGY_STORAGE_KEY = 'dautoTraders.strategy';

function SectionHeading({ children }) {
  return (
    <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
      {children}
    </h2>
  );
}

export default function Dashboard() {
  const { snapshot, loading, error } = useMarket();
  const symbols = snapshot?.symbols || [];
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [candles, setCandles] = useState([]);
  const [digits, setDigits] = useState(null);
  const [riskPercentage, setRiskPercentage] = useState(null);
  const [strategy, setStrategy] = useState(() => {
    try {
      return localStorage.getItem(STRATEGY_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    getSettings()
      .then((s) => setRiskPercentage(s.riskPercentage))
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STRATEGY_STORAGE_KEY, strategy ?? '');
    } catch {
      // localStorage unavailable — strategy choice just won't persist across reloads
    }
  }, [strategy]);

  // Default to whichever market currently has the best opportunity, so the chart
  // and analysis panels open already pointed at what the hero card is showing.
  useEffect(() => {
    if (selectedSymbol || symbols.length === 0) return;
    const signals = snapshot?.signals || [];
    const best = [...signals].filter((s) => s.type !== 'HOLD').sort((a, b) => b.confidence - a.confidence)[0];
    setSelectedSymbol(best?.symbol || symbols[0]);
  }, [symbols, selectedSymbol, snapshot]);

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

  const selectedSignal = signals.find((s) => s.symbol === selectedSymbol) || null;
  const selectedVolatility = volatility.find((v) => v.symbol === selectedSymbol) || null;

  return (
    <div className="p-6 flex flex-col gap-10 max-w-6xl mx-auto w-full">
      {error && (
        <div
          className="text-sm rounded-lg px-3 py-2.5"
          style={{ color: 'var(--status-warning)', background: 'color-mix(in srgb, var(--status-warning) 10%, transparent)' }}
        >
          Having trouble reaching the backend — showing the last known data. Retrying…
        </div>
      )}

      {/* Features 10 & 11 — live connection status + stop/refresh/reset controls. Kept thin so it never competes with the hero. */}
      <StatusBar />

      {/* ================= PRIORITY 1 — the one thing to act on ================= */}
      {/* Features 2, 6, 7 combined into a single big, bold, step-by-step hero */}
      <FeaturedTrade
        signal={topSignal}
        stake={stake}
        stakeTooLow={stakeTooLow}
        winRate={topSignalWinRate}
        volatility={topSignalVolatility}
      />

      {/* ================= PRIORITY 2 — the market, at a glance ================= */}
      <section className="flex flex-col gap-4">
        <SectionHeading>Price chart</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
          <VolatilityIndexTracker symbols={symbols} selected={selectedSymbol} onSelect={setSelectedSymbol} />
          {/* Feature 5 — big, clear candlestick chart with trend status */}
          <div className="card-hover rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <PriceChart candles={candles} symbol={selectedSymbol} />
          </div>
        </div>
      </section>

      {/* ================= PRIORITY 3 — supporting details, one tap away ================= */}
      {/* Every other feature (1, 2, 3, 4, 6, 7, 8, 9, 12) plus history and the full market list,
          bundled into a single reveal so the default screen stays down to hero + chart. */}
      <ExpandableSection
        icon="📋"
        accent="var(--series-blue)"
        title="Supporting details"
        subtitle="Volatility, trade setup, strategy, history, and everything else — all in one place"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Symbols tracked" value={symbols.length} icon="🌐" iconColor="var(--series-blue)" />
          <StatTile label="Total trades" value={tradeStats?.totalTrades ?? 0} icon="🔁" iconColor="var(--series-blue)" />
          <StatTile
            label="Total P&L"
            value={`${tradeStats?.totalPnl?.toFixed?.(2) ?? '0.00'}`}
            delta={tradeStats?.totalPnl !== undefined ? `${tradeStats.totalPnl >= 0 ? '+' : ''}${tradeStats.totalPnl.toFixed(2)}` : undefined}
            deltaGood={tradeStats?.totalPnl >= 0}
            icon="💰"
            iconColor={tradeStats?.totalPnl >= 0 ? 'var(--status-good)' : 'var(--status-critical)'}
          />
        </div>

        <LiveTicker signals={signals} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TradeSetupCard digits={digits} signal={selectedSignal} symbol={selectedSymbol} />
          <SignalAnalysis signal={selectedSignal} volatility={selectedVolatility} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TradeTypeCard digits={digits} signal={selectedSignal} symbol={selectedSymbol} preferredStrategy={strategy} />
          <PatternScanner digits={digits} symbol={selectedSymbol} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <VolatilityPanel volatility={volatility} />
          <div>
            <SectionHeading>Win rate</SectionHeading>
            <WinRateMeter winRate={tradeStats?.winRate ?? 0} totalTrades={tradeStats?.totalTrades ?? 0} />
          </div>
          <MarketTypeCard symbol={selectedSymbol} symbols={symbols} />
        </div>

        <StrategySelector value={strategy} onChange={setStrategy} />

        <div>
          <SectionHeading>Recent trades</SectionHeading>
          <div
            className="card-hover rounded-xl p-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--series-yellow)' }}
          >
            <TradeTable trades={recentTrades} />
          </div>
        </div>

        <div>
          <SectionHeading>All markets</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {signals.map((s) => (
              <SignalCard key={s.symbol} signal={s} featured={topSignal?.symbol === s.symbol} />
            ))}
          </div>
        </div>

        {/* Feature 12 — Deriv connector detail */}
        <div>
          <SectionHeading>Technical details</SectionHeading>
          <DerivConnector />
        </div>
      </ExpandableSection>
    </div>
  );
}
