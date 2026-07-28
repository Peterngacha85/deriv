const Backtest = require('../models/Backtest');
const derivService = require('../services/derivService');
const { runBacktest } = require('../services/backtestEngine');

const MAX_CANDLES = 1000; // Deriv's actual cap per ticks_history request (~2 days of 3-min candles)
const GRANULARITY_SECONDS = 180;

// POST /api/backtest/run  { symbol, count?, confirmThreshold? }
async function run(req, res, next) {
  try {
    const { symbol = 'R_10', count = MAX_CANDLES, confirmThreshold = 65 } = req.body;
    const candleCount = Math.min(Number(count) || MAX_CANDLES, MAX_CANDLES);

    const { candles } = await derivService.getCandles(symbol, {
      count: candleCount,
      granularity: GRANULARITY_SECONDS
    });

    const result = runBacktest(candles, { confirmThreshold });

    const saved = await Backtest.create({
      symbol,
      dataRange: result.dataRange,
      totalTrades: result.totalTrades,
      winCount: result.winCount,
      lossCount: result.lossCount,
      winRate: result.winRate,
      avgProfit: result.avgProfit,
      avgLoss: result.avgLoss,
      profitFactor: result.profitFactor,
      maxDrawdown: result.maxDrawdown,
      totalProfit: result.totalProfit,
      report: result.recommendation
    });

    res.status(201).json({ ...result, _id: saved._id, symbol, maxCandlesAvailable: MAX_CANDLES });
  } catch (err) {
    next(err);
  }
}

// GET /api/backtest/report/:id
async function report(req, res, next) {
  try {
    const backtest = await Backtest.findById(req.params.id);
    if (!backtest) return res.status(404).json({ error: 'Backtest not found' });
    res.status(200).json(backtest);
  } catch (err) {
    next(err);
  }
}

// GET /api/backtest/history?limit=20
async function history(req, res, next) {
  try {
    const { limit = 20 } = req.query;
    const backtests = await Backtest.find().sort({ createdAt: -1 }).limit(Math.min(Number(limit), 100));
    res.status(200).json(backtests);
  } catch (err) {
    next(err);
  }
}

module.exports = { run, report, history };
