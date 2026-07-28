const derivService = require('../services/derivService');
const volatilityAnalyzer = require('../services/volatilityAnalyzer');
const signalScheduler = require('../services/signalScheduler');
const { analyzeDigits } = require('../services/digitAnalyzer');
const { isValidSymbol, isNumberInRange } = require('../utils/validators');

// GET /api/market/status
function status(req, res) {
  res.status(200).json({
    marketDataConnected: derivService.isPublicConnected,
    accountConnected: derivService.isAccountConnected,
    subscribedSymbols: Array.from(derivService.subscriptions),
    latestBalance: derivService.latestBalance
  });
}

// GET /api/market/tick/:symbol
function latestTick(req, res) {
  const { symbol } = req.params;
  if (!isValidSymbol(symbol)) return res.status(400).json({ error: 'invalid symbol' });
  const tick = derivService.getLatestTick(symbol);
  if (!tick) {
    return res.status(404).json({ error: `No tick data yet for ${symbol}. Is it subscribed?` });
  }
  res.status(200).json(tick);
}

// POST /api/market/subscribe  { symbol }
function subscribe(req, res) {
  const { symbol } = req.body;
  if (!isValidSymbol(symbol)) return res.status(400).json({ error: 'symbol is required and must be a valid symbol code' });
  derivService.subscribeTicks(symbol);
  res.status(200).json({ message: `Subscribed to ${symbol}` });
}

// GET /api/market/chart?symbol=R_100&minutes=100
async function chart(req, res, next) {
  try {
    const { symbol = 'R_100', minutes = 100 } = req.query;
    if (!isValidSymbol(symbol)) return res.status(400).json({ error: 'invalid symbol' });
    if (!isNumberInRange(minutes, 1, 5000)) return res.status(400).json({ error: 'minutes must be between 1 and 5000' });

    const response = await derivService.getCandles(symbol, {
      count: Number(minutes),
      granularity: 180 // 3-minute candles per spec
    });
    res.status(200).json(response.candles || []);
  } catch (err) {
    next(err);
  }
}

// GET /api/market/volatility
function volatility(req, res) {
  res.status(200).json(volatilityAnalyzer.getAllSnapshots());
}

// GET /api/market/digits?market=R_100&candles=50
async function digits(req, res, next) {
  try {
    const { market = 'R_100', candles: candleCount = 50 } = req.query;
    if (!isValidSymbol(market)) return res.status(400).json({ error: 'invalid market symbol' });
    if (!isNumberInRange(candleCount, 1, 5000)) return res.status(400).json({ error: 'candles must be between 1 and 5000' });

    // Prefer the scheduler's already-computed analysis when it's fresh;
    // otherwise compute on demand from a fresh candle fetch.
    const cached = signalScheduler.getLatestDigits(market);
    if (cached) return res.status(200).json(cached);

    const response = await derivService.getCandles(market, { count: Number(candleCount), granularity: 180 });
    const analysis = analyzeDigits((response.candles || []).map((c) => c.close));
    res.status(200).json(analysis);
  } catch (err) {
    next(err);
  }
}

module.exports = { status, latestTick, subscribe, chart, volatility, digits };
