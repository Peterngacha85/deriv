export default function Backtest() {
  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Backtest
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        The backtesting engine (Phase 4) hasn't been built yet — this page will let you replay historical data
        through the signal engine and generate a win-rate / drawdown report.
      </p>
    </div>
  );
}
