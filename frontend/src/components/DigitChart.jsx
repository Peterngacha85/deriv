/**
 * Digit frequency bar chart — single series (magnitude across 0-9), so no
 * legend is needed; the title already names what's plotted.
 */
export default function DigitChart({ analysis }) {
  if (!analysis) return null;
  const { frequency, overUnder, evenOdd, matches, threshold } = analysis;
  const maxPct = Math.max(...frequency.map((d) => d.percentage), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2 h-32" role="img" aria-label="Last-digit frequency distribution">
        {frequency.map(({ digit, percentage, count }) => (
          <div key={digit} className="flex flex-col items-center gap-1.5 flex-1" title={`Digit ${digit}: ${count} (${percentage}%)`}>
            <div className="w-full flex items-end justify-center h-24">
              <div
                className="rounded-t"
                style={{
                  width: '20px',
                  height: `${Math.max((percentage / maxPct) * 100, 3)}%`,
                  background: 'var(--series-blue)'
                }}
              />
            </div>
            <span className="text-xs tabular" style={{ color: 'var(--text-muted)' }}>
              {digit}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs tabular">
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Over/Under ({threshold})</div>
          <div style={{ color: 'var(--text-primary)' }}>
            {overUnder.overPercentage}% / {overUnder.underPercentage}%
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Even/Odd</div>
          <div style={{ color: 'var(--text-primary)' }}>
            {evenOdd.evenPercentage}% / {evenOdd.oddPercentage}%
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Matches</div>
          <div style={{ color: 'var(--text-primary)' }}>{matches.percentage}%</div>
        </div>
      </div>

      <details>
        <summary className="text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          View as table
        </summary>
        <table className="w-full text-xs mt-2 tabular" style={{ color: 'var(--text-secondary)' }}>
          <thead>
            <tr className="text-left">
              <th className="font-normal">Digit</th>
              <th className="font-normal">Count</th>
              <th className="font-normal">%</th>
            </tr>
          </thead>
          <tbody>
            {frequency.map(({ digit, count, percentage }) => (
              <tr key={digit}>
                <td>{digit}</td>
                <td>{count}</td>
                <td>{percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
