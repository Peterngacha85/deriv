import { useEffect, useRef, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { getLatestTick, subscribeSymbol } from '../services/api';
import StatusBadge from './StatusBadge';

const TRACKING_STORAGE_KEY = 'dautoTraders.volatilityTracking';
const TICK_POLL_MS = 2000;
const SWITCH_DELAY_MS = 900;

// Every volatility index symbol Deriv actually offers (Continuous Indices),
// grouped the way they appear on the platform. Only the "standard" group is
// auto-subscribed on backend boot (backend/config/deriv.js: defaultSymbols) —
// selecting anything else triggers an on-demand subscribe (see effect below).
const INDEX_GROUPS = [
  {
    label: 'Standard',
    symbols: [
      { symbol: 'R_10', label: 'Volatility 10 Index', alias: 'V-7' },
      { symbol: 'R_25', label: 'Volatility 25 Index', alias: 'V-10' },
      { symbol: 'R_50', label: 'Volatility 50 Index', alias: 'V-25' },
      { symbol: 'R_75', label: 'Volatility 75 Index', alias: 'V-50' },
      { symbol: 'R_100', label: 'Volatility 100 Index', alias: 'V-75' }
    ]
  },
  {
    label: '1-second',
    symbols: [
      { symbol: '1HZ10V', label: 'Volatility 10 (1s) Index' },
      { symbol: '1HZ15V', label: 'Volatility 15 (1s) Index' },
      { symbol: '1HZ25V', label: 'Volatility 25 (1s) Index' },
      { symbol: '1HZ30V', label: 'Volatility 30 (1s) Index' },
      { symbol: '1HZ50V', label: 'Volatility 50 (1s) Index' },
      { symbol: '1HZ75V', label: 'Volatility 75 (1s) Index' },
      { symbol: '1HZ90V', label: 'Volatility 90 (1s) Index' },
      { symbol: '1HZ100V', label: 'Volatility 100 (1s) Index', alias: 'V-100' }
    ]
  }
];

const INDEX_META = Object.fromEntries(INDEX_GROUPS.flatMap((g) => g.symbols).map((s) => [s.symbol, s]));

// The 6 symbols the backend already streams on boot — everything else needs
// an explicit subscribe before ticks will start arriving for it.
const PRESUBSCRIBED = new Set(['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ100V']);

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
export default function VolatilityIndexTracker({ selected, onSelect }) {
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
  const subscribedRef = useRef(new Set(PRESUBSCRIBED));

  useEffect(() => {
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY, String(tracking));
    } catch {
      // localStorage unavailable — tracking preference just won't persist across reloads
    }
  }, [tracking]);

  // Reset the tick counter whenever the tracked index changes, subscribe it if the
  // backend isn't already streaming it, and show a brief "switching" state so the
  // status line doesn't jump straight to stale data.
  useEffect(() => {
    setDataPoints(0);
    setLastUpdate(null);
    setLastPrice(null);
    lastTickEpoch.current = null;
    if (!selected) return undefined;

    if (!subscribedRef.current.has(selected)) {
      subscribedRef.current.add(selected);
      subscribeSymbol(selected).catch(() => subscribedRef.current.delete(selected));
    }

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
            <div className="flex flex-col gap-2.5 pt-1.5 max-h-80 overflow-y-auto">
              {INDEX_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5" style={{ color: 'var(--text-muted)' }}>
                    {group.label}
                  </span>
                  {group.symbols.map((info) => {
                    const isSelected = info.symbol === selected;
                    return (
                      <button
                        key={info.symbol}
                        onClick={() => {
                          onSelect(info.symbol);
                          setOpen(false);
                        }}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-sm transition-colors"
                        style={{ background: isSelected ? 'var(--brand-wash)' : 'transparent', color: 'var(--text-primary)' }}
                      >
                        <span className="flex flex-col">
                          <span className="font-medium">{info.label}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {info.symbol}
                            {info.alias && ` · alt. ${info.alias}`}
                          </span>
                        </span>
                        {isSelected && <span style={{ color: 'var(--brand)' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
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
