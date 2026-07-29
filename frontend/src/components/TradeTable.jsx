const RESULT_STYLE = {
  WON: { color: 'var(--status-good)', bg: 'color-mix(in srgb, var(--status-good) 14%, transparent)' },
  LOST: { color: 'var(--status-critical)', bg: 'color-mix(in srgb, var(--status-critical) 14%, transparent)' },
  OPEN: { color: 'var(--text-muted)', bg: 'var(--surface-2)' }
};

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
          {trades.map((t, i) => {
            const resultStyle = RESULT_STYLE[t.result] || RESULT_STYLE.OPEN;
            return (
              <tr
                key={t._id}
                className="table-row-hover"
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--surface-2)' : 'transparent' }}
              >
                <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                  {formatTime(t.timestamp)}
                </td>
                <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.symbol}
                </td>
                <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                  {t.entryPrice}
                </td>
                <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                  {t.exitPrice ?? '—'}
                </td>
                <td className="py-2 px-2 font-medium" style={{ color: t.pnl >= 0 ? 'var(--status-good)' : 'var(--status-critical)' }}>
                  {t.pnl !== undefined && t.pnl !== null ? t.pnl.toFixed(2) : '—'}
                </td>
                <td className="py-2 px-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ color: resultStyle.color, background: resultStyle.bg }}
                  >
                    {t.result}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
