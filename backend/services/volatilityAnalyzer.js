const { atr } = require('../utils/indicators');

const ATR_PERIOD = 14;
const HISTORY_SIZE = 20; // how many readings to keep per symbol for trend detection
const TREND_EPSILON = 0.05; // relative change below this is treated as "stable"

/**
 * Tracks volatility level (ATR as a % of price) per symbol over time and
 * classifies the trend as increasing/decreasing/stable.
 */
class VolatilityAnalyzer {
  constructor() {
    this.history = new Map(); // symbol -> array of { atrPct, timestamp }
  }

  update(symbol, candles) {
    if (!candles || candles.length < ATR_PERIOD + 1) return null;

    const currentPrice = candles[candles.length - 1].close;
    const atrValue = atr(candles, ATR_PERIOD);
    if (atrValue === null) return null;

    const atrPct = atrValue / currentPrice;

    const series = this.history.get(symbol) || [];
    series.push({ atrPct, timestamp: new Date() });
    if (series.length > HISTORY_SIZE) series.shift();
    this.history.set(symbol, series);

    return this.getSnapshot(symbol);
  }

  getSnapshot(symbol) {
    const series = this.history.get(symbol);
    if (!series || series.length === 0) return null;

    const latest = series[series.length - 1].atrPct;
    const trend = this._classifyTrend(series);

    return {
      symbol,
      atrPct: latest,
      level: this._classifyLevel(latest),
      trend,
      updatedAt: series[series.length - 1].timestamp
    };
  }

  getAllSnapshots() {
    return Array.from(this.history.keys()).map((symbol) => this.getSnapshot(symbol));
  }

  _classifyTrend(series) {
    if (series.length < 4) return 'stable';
    const midpoint = Math.floor(series.length / 2);
    const olderAvg = average(series.slice(0, midpoint).map((s) => s.atrPct));
    const recentAvg = average(series.slice(midpoint).map((s) => s.atrPct));
    if (olderAvg === 0) return 'stable';

    const relativeChange = (recentAvg - olderAvg) / olderAvg;
    if (relativeChange > TREND_EPSILON) return 'increasing';
    if (relativeChange < -TREND_EPSILON) return 'decreasing';
    return 'stable';
  }

  _classifyLevel(atrPct) {
    if (atrPct < 0.003) return 'low';
    if (atrPct < 0.008) return 'medium';
    return 'high';
  }
}

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

module.exports = new VolatilityAnalyzer();
