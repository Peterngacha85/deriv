const RESULT_COLOR = { WON: 'var(--status-good)', LOST: 'var(--status-critical)', OPEN: 'var(--text-muted)' };

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TradeTable({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No trades logged yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular">
        <thead>
          <tr className="text-left" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            <th className="font-normal py-2">Time</th>
            <th className="font-normal py-2">Symbol</th>
            <th className="font-normal py-2">Entry</th>
            <th className="font-normal py-2">Exit</th>
            <th className="font-normal py-2">P&amp;L</th>
            <th className="font-normal py-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(t.timestamp)}
              </td>
              <td className="py-2" style={{ color: 'var(--text-primary)' }}>
                {t.symbol}
              </td>
              <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
                {t.entryPrice}
              </td>
              <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
                {t.exitPrice ?? '—'}
              </td>
              <td className="py-2" style={{ color: t.pnl >= 0 ? 'var(--status-good)' : 'var(--status-critical)' }}>
                {t.pnl !== undefined && t.pnl !== null ? t.pnl.toFixed(2) : '—'}
              </td>
              <td className="py-2">
                <span style={{ color: RESULT_COLOR[t.result] || 'var(--text-muted)' }}>{t.result}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
