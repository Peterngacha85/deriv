const SKEW_THRESHOLD = 8; // percentage points away from 50/50 before a pattern is worth acting on

function overUnderRec(digits) {
  const isOver = (digits.overUnder?.overPercentage ?? 50) > 50;
  return {
    title: 'Over/Under',
    detail: `Predict: next digit ${isOver ? 'over' : 'under'} ${digits.threshold ?? 5}`,
    confidence: Math.round(isOver ? digits.overUnder.overPercentage : digits.overUnder.underPercentage)
  };
}

function evenOddRec(digits) {
  const isEven = (digits.evenOdd?.evenPercentage ?? 50) > 50;
  return {
    title: 'Even/Odd',
    detail: `Predict: next digit is ${isEven ? 'even' : 'odd'}`,
    confidence: Math.round(isEven ? digits.evenOdd.evenPercentage : digits.evenOdd.oddPercentage)
  };
}

function directionRec(signal) {
  if (!signal || signal.type === 'HOLD') {
    return { title: 'Direction (Up/Down)', detail: 'No active direction signal on this market right now.', confidence: null };
  }
  return {
    title: 'Direction (Up/Down)',
    detail: `Predict: price goes ${signal.directionLabel || (signal.type === 'BUY' ? 'up' : 'down')}`,
    confidence: signal.confidence
  };
}

function matchesRec(digits) {
  return {
    title: 'Digit Matches',
    detail: 'Predict: the next digit repeats a recent one',
    confidence: digits.matches ? Math.round(digits.matches.percentage) : null
  };
}

// preferredStrategy lets the Strategy Selector (feature 9) force a specific view;
// with no preference, auto-pick whichever pattern is skewed furthest from 50/50.
function pickRecommendation(digits, signal, preferredStrategy) {
  if (!digits) return null;

  if (preferredStrategy === 'overunder') return overUnderRec(digits);
  if (preferredStrategy === 'evenodd') return evenOddRec(digits);
  if (preferredStrategy === 'direction') return directionRec(signal);
  if (preferredStrategy === 'matches') return matchesRec(digits);

  const overSkew = Math.abs((digits.overUnder?.overPercentage ?? 50) - 50);
  const evenSkew = Math.abs((digits.evenOdd?.evenPercentage ?? 50) - 50);

  if (overSkew >= evenSkew && overSkew > SKEW_THRESHOLD) return overUnderRec(digits);
  if (evenSkew > SKEW_THRESHOLD) return evenOddRec(digits);
  if (signal && signal.type !== 'HOLD') return directionRec(signal);
  return { title: 'No clear pattern yet', detail: 'Digits are evenly spread — wait for a clearer setup.', confidence: null };
}

/** Feature 2 — which trade type the system currently recommends for this market. */
export default function TradeTypeCard({ digits, signal, symbol, preferredStrategy }) {
  const rec = pickRecommendation(digits, signal, preferredStrategy);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2.5"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--series-aqua)' }}
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Trade type — {symbol}
      </span>
      {rec ? (
        <>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold" style={{ color: 'var(--brand)' }}>
              {rec.title}
            </span>
            {rec.confidence !== null && (
              <span className="text-xs font-semibold tabular" style={{ color: 'var(--text-muted)' }}>
                {rec.confidence}% confidence
              </span>
            )}
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {rec.detail}
          </span>
        </>
      ) : (
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Waiting for digit data…
        </span>
      )}
    </div>
  );
}
