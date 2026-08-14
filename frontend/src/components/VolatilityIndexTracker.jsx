import { useEffect, useRef, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { getLatestTick } from '../services/api';
import StatusBadge from './StatusBadge';

const TRACKING_STORAGE_KEY = 'dautoTraders.volatilityTracking';
const TICK_POLL_MS = 2000;
const SWITCH_DELAY_MS = 900;

// Friendly names + the client's classic aliases, keyed by the real Deriv symbol
// codes this app actually streams (backend/config/deriv.js: defaultSymbols).
const INDEX_META = {
  R_10: { label: 'Volatility 10 Index', alias: 'V-7' },
  R_25: { label: 'Volatility 25 Index', alias: 'V-10' },
  R_50: { label: 'Volatility 50 Index', alias: 'V-25' },
  R_75: { label: 'Volatility 75 Index', alias: 'V-50' },
  R_100: { label: 'Volatility 100 Index', alias: 'V-75' },
  '1HZ100V': { label: '1-Second Volatility 100', alias: 'V-100' }
};

function elapsedLabel(sinceMs) {
  if (!sinceMs) return '—';
  const seconds = Math.max(0, Math.round((Date.now() - sinceMs) / 1000));
  if (seconds < 1) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

/**
 * Standalone "select which volatility index to follow" control. Toggling it off
 * pauses this widget's own tick polling; switching the index resets the tick
 * counter and briefly shows a loading state before the next tick lands.
 */
export default function VolatilityIndexTracker({ symbols = [], selected, onSelect }) {
  const { snapshot } = useMarket();
  const marketDataConnected = snapshot?.connection?.marketDataConnected;

  const [tracking, setTracking] = useState(() => {
    try {
      const saved = localStorage.getItem(TRACKING_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [dataPoints, setDataPoints] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastPrice, setLastPrice] = useState(null);
  const lastTickEpoch = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY, String(tracking));
    } catch {
      // localStorage unavailable — tracking preference just won't persist across reloads
    }
  }, [tracking]);

  // Reset the tick counter whenever the tracked index changes, and show a brief
  // "switching" state so the status line doesn't jump straight to stale data.
  useEffect(() => {
    setDataPoints(0);
    setLastUpdate(null);
    setLastPrice(null);
    lastTickEpoch.current = null;
    if (!selected) return undefined;
    setSwitching(true);
    const timer = setTimeout(() => setSwitching(false), SWITCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [selected]);

  useEffect(() => {
    if (!tracking || !selected) return undefined;
    let cancelled = false;

    async function poll() {
      try {
        const tick = await getLatestTick(selected);
        if (cancelled || !tick) return;
        if (tick.epoch && tick.epoch !== lastTickEpoch.current) {
          lastTickEpoch.current = tick.epoch;
          setDataPoints((n) => n + 1);
          setLastPrice(tick.quote ?? null);
          setLastUpdate(Date.now());
        }
      } catch {
        // transient — next poll retries
      }
    }

    poll();
    const timer = setInterval(poll, TICK_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tracking, selected]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const meta = INDEX_META[selected] || { label: selected || '—', alias: null };
  const live = tracking && marketDataConnected;

  return (
    <div
      ref={containerRef}
      className="rounded-xl p-4 flex flex-col gap-3 relative"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderLeft: '4px solid var(--brand)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Volatility tracking
        </span>
        <button
          onClick={() => setTracking((t) => !t)}
          role="switch"
          aria-checked={tracking}
          title={tracking ? 'Pause tracking' : 'Resume tracking'}
          className="relative shrink-0"
          style={{ width: '38px', height: '22px', borderRadius: '999px', background: tracking ? 'var(--status-good)' : 'var(--border)', transition: 'background 0.2s ease' }}
        >
          <span
            aria-hidden="true"
            className="absolute rounded-full"
            style={{ width: '16px', height: '16px', top: '3px', left: tracking ? '19px' : '3px', background: '#fff', transition: 'left 0.2s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Select index
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <span>
            {meta.label}
            {meta.alias && (
              <span className="ml-1.5 font-normal" style={{ color: 'var(--text-muted)' }}>
                ({meta.alias})
              </span>
            )}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
            {open ? '▲' : '▼'}
          </span>
        </button>

        <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-1.5">
              {symbols.map((symbol) => {
                const info = INDEX_META[symbol] || { label: symbol, alias: null };
                const isSelected = symbol === selected;
                return (
                  <button
                    key={symbol}
                    onClick={() => {
                      onSelect(symbol);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm transition-colors"
                    style={{ background: isSelected ? 'var(--brand-wash)' : 'transparent', color: 'var(--text-primary)' }}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{info.label}</span>
                      {info.alias && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {symbol} · alt. {info.alias}
                        </span>
                      )}
                    </span>
                    {isSelected && <span style={{ color: 'var(--brand)' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
        {!tracking ? (
          <span className="font-medium" style={{ color: 'var(--status-warning)' }}>
            ⏸ Tracking paused
          </span>
        ) : switching ? (
          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>
            Switching…
          </span>
        ) : (
          <StatusBadge status={live ? 'good' : 'critical'} label={live ? 'Live' : 'Disconnected'} />
        )}
        <span className="tabular truncate" style={{ color: 'var(--text-muted)' }}>
          {tracking && !switching
            ? `${dataPoints.toLocaleString()} ticks · updated ${elapsedLabel(lastUpdate)}${lastPrice !== null ? ` · ${lastPrice}` : ''}`
            : 'Click ON to resume'}
        </span>
      </div>
    </div>
  );
}
