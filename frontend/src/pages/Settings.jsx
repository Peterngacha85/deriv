import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../services/api';

const FIELDS = [
  {
    key: 'confirmThreshold',
    label: 'Confidence threshold',
    suffix: '%',
    min: 0,
    max: 100,
    step: 1,
    help: 'Minimum confidence a signal needs to fire as BUY/SELL instead of HOLD. Lower = more trades, likely lower quality.'
  },
  {
    key: 'riskPercentage',
    label: 'Risk per trade',
    suffix: '%',
    min: 0.1,
    max: 20,
    step: 0.1,
    help: 'Simulated dollars risked per trade, as a % of a $500 reference notional (2% = $10 risked if the stop is hit).'
  },
  {
    key: 'maxTradesPerDay',
    label: 'Max trades per day',
    suffix: '',
    min: 1,
    max: 500,
    step: 1,
    help: 'Once this many trades have opened today, new signals are logged but no new simulated trade opens.'
  },
  {
    key: 'slippagePercentage',
    label: 'Slippage',
    suffix: '%',
    min: 0,
    max: 5,
    step: 0.1,
    help: 'Applied only to live trades, not backtests — this is why live results run a bit below backtest.'
  },
  {
    key: 'commissionPercentage',
    label: 'Commission',
    suffix: '%',
    min: 0,
    max: 5,
    step: 0.1,
    help: 'Applied only to live trades, not backtests, same as slippage.'
  }
];

export default function Settings() {
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setValues)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings(values);
      setValues(updated);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  const riskAmount = values ? ((500 * Number(values.riskPercentage)) / 100).toFixed(2) : null;

  return (
    <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          These take effect immediately on the live signal engine and simulated trade tracker — no restart
          needed.
        </p>
      </div>

      {loading && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading…
        </p>
      )}

      {error && (
        <div className="text-sm" style={{ color: 'var(--status-critical)' }}>
          {error}
        </div>
      )}

      {values && (
        <div
          className="rounded-xl p-5 flex flex-col gap-5"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {field.label}
                </label>
                <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
                  {values[field.key]}
                  {field.suffix}
                  {field.key === 'riskPercentage' && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (${riskAmount})</span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, Number(e.target.value))}
                style={{ accentColor: 'var(--brand)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {field.help}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-full text-sm font-medium mt-3"
              style={{ background: 'var(--brand)', color: '#fff', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="text-sm mt-3" style={{ color: 'var(--status-good)' }}>
                Saved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
