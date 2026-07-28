const { sma, rsi, macd, atr } = require('../utils/indicators');

const RSI_PERIOD = 14;
const MA_FAST_PERIOD = 20;
const MA_SLOW_PERIOD = 50;
const ATR_PERIOD = 14;

// How much of the current price an ATR reading has to represent before we
// treat the market as "maximally volatile" (volatilityScore -> 0). Tuned
// against Deriv's synthetic indices, where a single 3-min candle regularly
// moves a fraction of a percent.
const ATR_PCT_AT_MAX_VOLATILITY = 0.015;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

/**
 * Computes direction/volatility/momentum scores and a resulting signal from
 * a series of OHLC candles (oldest -> newest). Mirrors the confidence
 * formula from the spec: (direction + volatility + momentum) / 3 * 100.
 */
function generateSignal(candles, { confirmThreshold = 65 } = {}) {
  if (!candles || candles.length < MA_SLOW_PERIOD + 1) {
    return null; // not enough history yet
  }

  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1];

  const maFast = sma(closes, MA_FAST_PERIOD);
  const maSlow = sma(closes, MA_SLOW_PERIOD);
  const rsiValue = rsi(closes, RSI_PERIOD);
  const { histogram: macdHistogram } = macd(closes);
  const atrValue = atr(candles, ATR_PERIOD);

  if ([maFast, maSlow, rsiValue, macdHistogram, atrValue].some((v) => v === null)) {
    return null;
  }

  // --- Direction (0 = DOWN, 1 = UP) ---
  const maScore = maFast > maSlow ? 1 : 0;
  const rsiDirectionScore = clamp01(rsiValue / 100);
  const macdScore = macdHistogram > 0 ? 1 : 0;
  const directionScore = (maScore + rsiDirectionScore + macdScore) / 3;

  let directionLabel = 'SIDEWAYS';
  if (directionScore > 0.6) directionLabel = 'UP';
  else if (directionScore < 0.4) directionLabel = 'DOWN';

  // --- Volatility (0 = high volatility, 1 = low volatility) ---
  const atrPct = atrValue / currentPrice;
  const volatilityScore = clamp01(1 - atrPct / ATR_PCT_AT_MAX_VOLATILITY);

  // --- Momentum (0 = weak, 1 = strong, direction-agnostic) ---
  const rsiMomentum = clamp01(Math.abs(rsiValue - 50) / 50);
  const macdMomentum = clamp01(Math.abs(macdHistogram) / (currentPrice * 0.002));
  const momentumScore = (rsiMomentum + macdMomentum) / 2;

  const confidence = Math.round(((directionScore + volatilityScore + momentumScore) / 3) * 100);

  let type = 'HOLD';
  if (directionScore > 0.6 && confidence > confirmThreshold) type = 'BUY';
  else if (directionScore < 0.4 && confidence > confirmThreshold) type = 'SELL';

  const stopLoss = type === 'SELL' ? currentPrice + atrValue : currentPrice - atrValue;
  const takeProfit = type === 'SELL' ? currentPrice - atrValue * 1.5 : currentPrice + atrValue * 1.5;

  return {
    type,
    directionLabel,
    confidence,
    priceAtSignal: currentPrice,
    stopLoss,
    takeProfit,
    directionScore,
    volatilityScore,
    momentumScore,
    indicators: { rsi: rsiValue, maFast, maSlow, macdHistogram, atr: atrValue },
    timestamp: new Date()
  };
}

module.exports = { generateSignal };
