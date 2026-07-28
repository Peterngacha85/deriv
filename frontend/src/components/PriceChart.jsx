import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';

function readColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

export default function PriceChart({ candles, symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: readColor('--surface-1') },
        textColor: readColor('--text-secondary'),
        attributionLogo: false
      },
      grid: {
        vertLines: { color: readColor('--gridline') },
        horzLines: { color: readColor('--gridline') }
      },
      rightPriceScale: { borderColor: readColor('--baseline') },
      timeScale: { borderColor: readColor('--baseline') },
      autoSize: true
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: readColor('--status-good'),
      downColor: readColor('--status-critical'),
      borderVisible: false,
      wickUpColor: readColor('--status-good'),
      wickDownColor: readColor('--status-critical')
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !candles || candles.length === 0) return;
    const formatted = candles.map((c) => ({
      time: c.epoch,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    seriesRef.current.setData(formatted);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div>
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        {symbol} · 3-minute candles
      </div>
      <div ref={containerRef} style={{ height: '320px', width: '100%' }} />
    </div>
  );
}
