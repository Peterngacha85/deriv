import { useEffect, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { runBacktest, getBacktestHistory } from '../services/api';
import StatTile from '../components/StatTile';
import EquityCurve from '../components/EquityCurve';

export default function Backtest() {
  const { snapshot } = useMarket();
  const symbols = snapshot?.symbols || [];
  const [symbol, setSymbol] = useState('');
  const [confirmThreshold, setConfirmThreshold] = useState(65);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!symbol && symbols.length > 0) setSymbol(symbols[0]);
  }, [symbols, symbol]);

  useEffect(() => {
    getBacktestHistory({ limit: 10 }).then(setHistory).catch(() => {});
  }, [result]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      const data = await runBacktest({ symbol, confirmThreshold: Number(confirmThreshold) });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Backtest
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Replays the same signal engine used live against recent historical candles — no lookahead, one
          position at a time per symbol, identical P&L math to live trading. Limited to Deriv's max of 1,000
          candles per request (~2 days of 3-minute data).
        </p>
      </div>

      <div
        className="rounded-xl p-4 flex flex-wrap items-end gap-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Symbol
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Confidence threshold
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={confirmThreshold}
            onChange={(e) => setConfirmThreshold(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm w-28 tabular"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={running || !symbol}
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: 'var(--brand)', color: '#fff', opacity: running ? 0.6 : 1 }}
        >
          {running ? 'Running…' : 'Run backtest'}
        </button>
      </div>

      {error && (
        <div className="text-sm" style={{ color: 'var(--status-critical)' }}>
          {error}
        </div>
      )}

      {result && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatTile label="Total trades" value={result.totalTrades} />
            <StatTile
              label="Win rate"
              value={`${result.winRate}%`}
              sublabel={`${result.winCount}W / ${result.lossCount}L`}
            />
            <StatTile label="Profit factor" value={result.profitFactor ?? '∞'} />
            <StatTile
              label="Total P&L"
              value={result.totalProfit.toFixed(2)}
              delta={`${result.totalProfit >= 0 ? '+' : ''}${result.totalProfit.toFixed(2)}`}
              deltaGood={result.totalProfit >= 0}
            />
            <StatTile label="Avg win" value={result.avgProfit.toFixed(2)} deltaGood sublabel=" " />
            <StatTile label="Avg loss" value={result.avgLoss.toFixed(2)} sublabel=" " />
            <StatTile label="Max drawdown" value={`-${result.maxDrawdown.toFixed(2)}`} sublabel=" " />
            <StatTile
              label="Data range"
              value={new Date(result.dataRange.from).toLocaleDateString()}
              sublabel={`to ${new Date(result.dataRange.to).toLocaleDateString()}`}
            />
          </section>

          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Cumulative P&L across {result.totalTrades} trades
            </div>
            <EquityCurve trades={result.trades} />
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {result.recommendation}
          </div>
        </>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Past runs
          </h2>
          <div className="rounded-xl overflow-x-auto" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm tabular">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th className="font-normal py-2 px-4">Date</th>
                  <th className="font-normal py-2 px-4">Symbol</th>
                  <th className="font-normal py-2 px-4">Trades</th>
                  <th className="font-normal py-2 px-4">Win rate</th>
                  <th className="font-normal py-2 px-4">Total P&L</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(h.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>
                      {h.symbol}
                    </td>
                    <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {h.totalTrades}
                    </td>
                    <td className="py-2 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {h.winRate}%
                    </td>
                    <td className="py-2 px-4" style={{ color: h.totalProfit >= 0 ? 'var(--status-good)' : 'var(--status-critical)' }}>
                      {h.totalProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
