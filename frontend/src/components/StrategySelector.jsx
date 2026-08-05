const STRATEGIES = [
  { key: null, title: 'Auto (recommended)', description: 'Follow whichever pattern is strongest right now' },
  { key: 'overunder', title: 'Over/Under', description: 'Predict whether the next digit is above or below the middle' },
  { key: 'evenodd', title: 'Even/Odd', description: 'Predict whether the next digit is even or odd' },
  { key: 'direction', title: 'Direction (Up/Down)', description: 'Predict whether the price goes up or down' },
  { key: 'matches', title: 'Digit Matches', description: 'Predict whether the next digit repeats a recent one' }
];

/** Feature 9 — lets the user focus the Trade Type card (feature 2) on one pattern instead of the auto pick. */
export default function StrategySelector({ value, onChange }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2.5" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Select your strategy
      </span>
      <div className="flex flex-col gap-1.5">
        {STRATEGIES.map((s) => {
          const selected = value === s.key;
          return (
            <label
              key={s.title}
              className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors"
              style={{ background: selected ? 'var(--brand-wash)' : 'transparent' }}
            >
              <input
                type="radio"
                name="strategy"
                checked={selected}
                onChange={() => onChange(s.key)}
                className="mt-0.5"
                style={{ accentColor: 'var(--brand)' }}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {s.title}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {s.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
