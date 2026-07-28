import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { getDashboardSnapshot } from '../services/api';

const MarketContext = createContext(null);

const POLL_INTERVAL_MS = 5000;
const STRONG_SIGNAL_CONFIDENCE = 75;
const MAX_ALERTS = 20;

function detectAlerts(snapshot, lastSignalTimestamps, lastVolatilityLevels) {
  const alerts = [];

  for (const signal of snapshot.signals || []) {
    const isStrong = signal.type !== 'HOLD' && signal.confidence > STRONG_SIGNAL_CONFIDENCE;
    const isNew = lastSignalTimestamps.current.get(signal.symbol) !== signal.timestamp;
    if (isStrong && isNew) {
      alerts.push({
        id: `signal-${signal.symbol}-${signal.timestamp}`,
        type: 'signal',
        level: signal.type === 'BUY' ? 'good' : 'critical',
        title: `Strong ${signal.type} signal`,
        message: `${signal.symbol} at ${signal.confidence}% confidence`,
        createdAt: Date.now()
      });
    }
    lastSignalTimestamps.current.set(signal.symbol, signal.timestamp);
  }

  for (const vol of snapshot.volatility || []) {
    const previousLevel = lastVolatilityLevels.current.get(vol.symbol);
    if (vol.level === 'high' && previousLevel !== 'high') {
      alerts.push({
        id: `volatility-${vol.symbol}-${vol.updatedAt}`,
        type: 'volatility',
        level: 'warning',
        title: 'Volatility spike',
        message: `${vol.symbol} jumped to high volatility (${(vol.atrPct * 100).toFixed(2)}% ATR)`,
        createdAt: Date.now()
      });
    }
    lastVolatilityLevels.current.set(vol.symbol, vol.level);
  }

  return alerts;
}

export function MarketProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const timerRef = useRef(null);
  const lastSignalTimestamps = useRef(new Map());
  const lastVolatilityLevels = useRef(new Map());
  const isFirstSnapshot = useRef(true);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getDashboardSnapshot();
        if (!cancelled) {
          // Skip alerting on the very first snapshot — everything would look "new"
          // against empty tracking maps, flooding the UI on page load.
          if (!isFirstSnapshot.current) {
            const newAlerts = detectAlerts(data, lastSignalTimestamps, lastVolatilityLevels);
            if (newAlerts.length > 0) {
              setAlerts((prev) => [...newAlerts, ...prev].slice(0, MAX_ALERTS));
            }
          } else {
            detectAlerts(data, lastSignalTimestamps, lastVolatilityLevels); // still seed the tracking maps
            isFirstSnapshot.current = false;
          }
          setSnapshot(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <MarketContext.Provider value={{ snapshot, error, loading, alerts, dismissAlert }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within a MarketProvider');
  return ctx;
}
