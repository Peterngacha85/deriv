/**
 * Technical indicator calculations, operating on plain arrays of candles
 * ({ open, high, low, close, epoch }) ordered oldest -> newest.
 */

function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((sum, v) => sum + v, 0) / period;
}

/** Returns the full EMA series (same length as input, first `period - 1` entries are null). */
function emaSeries(values, period) {
  const k = 2 / (period + 1);
  const out = new Array(values.length).fill(null);
  if (values.length < period) return out;

  let prev = values.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function ema(values, period) {
  const series = emaSeries(values, period);
  return series[series.length - 1];
}

/** Wilder's RSI. Returns null if there isn't enough data (needs period + 1 closes). */
function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Standard MACD(12,26,9). Returns null fields if there isn't enough data. */
function macd(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (closes.length < slowPeriod + signalPeriod) {
    return { macdLine: null, signalLine: null, histogram: null };
  }

  const fastEma = emaSeries(closes, fastPeriod);
  const slowEma = emaSeries(closes, slowPeriod);

  const macdSeries = closes.map((_, i) =>
    fastEma[i] !== null && slowEma[i] !== null ? fastEma[i] - slowEma[i] : null
  );

  const macdValuesOnly = macdSeries.filter((v) => v !== null);
  const signalSeriesOnly = emaSeries(macdValuesOnly, signalPeriod);
  const signalLine = signalSeriesOnly[signalSeriesOnly.length - 1];

  const macdLine = macdSeries[macdSeries.length - 1];
  const histogram = macdLine !== null && signalLine !== null ? macdLine - signalLine : null;

  return { macdLine, signalLine, histogram };
}

/** Wilder's ATR from OHLC candles. Returns null if there isn't enough data. */
function atr(candles, period = 14) {
  if (candles.length < period + 1) return null;

  const trueRanges = [];
  for (let i = 1; i < candles.length; i++) {
    const { high, low } = candles[i];
    const prevClose = candles[i - 1].close;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }

  let avg = trueRanges.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    avg = (avg * (period - 1) + trueRanges[i]) / period;
  }
  return avg;
}

module.exports = { sma, ema, emaSeries, rsi, macd, atr };
