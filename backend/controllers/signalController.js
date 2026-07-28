const Signal = require('../models/Signal');
const signalScheduler = require('../services/signalScheduler');

// GET /api/signals/latest?symbol=R_100
function latest(req, res) {
  const { symbol } = req.query;
  if (symbol) {
    const signal = signalScheduler.getLatestSignal(symbol);
    if (!signal) return res.status(404).json({ error: `No signal yet for ${symbol}` });
    return res.status(200).json(signal);
  }
  res.status(200).json(signalScheduler.getAllLatestSignals());
}

// GET /api/signals/history?limit=50&symbol=R_100
async function history(req, res, next) {
  try {
    const { limit = 50, symbol } = req.query;
    const filter = symbol ? { symbol } : {};
    const signals = await Signal.find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit), 200));
    res.status(200).json(signals);
  } catch (err) {
    next(err);
  }
}

// POST /api/signals/manual — create a signal directly, for testing the pipeline end-to-end
async function manual(req, res, next) {
  try {
    const { symbol, type, confidence, priceAtSignal, stopLoss, takeProfit } = req.body;
    if (!symbol || !type || confidence === undefined || priceAtSignal === undefined) {
      return res.status(400).json({ error: 'symbol, type, confidence and priceAtSignal are required' });
    }
    const signal = await Signal.create({
      symbol,
      type,
      confidence,
      priceAtSignal,
      stopLoss,
      takeProfit,
      directionScore: 0,
      volatilityScore: 0,
      momentumScore: 0,
      notes: 'Created manually via /api/signals/manual'
    });
    res.status(201).json(signal);
  } catch (err) {
    next(err);
  }
}

module.exports = { latest, history, manual };
