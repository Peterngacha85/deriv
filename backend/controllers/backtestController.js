const mongoose = require('mongoose');
const Backtest = require('../models/Backtest');
const derivService = require('../services/derivService');
const { runBacktest } = require('../services/backtestEngine');
const { isValidSymbol, isNumberInRange } = require('../utils/validators');

const GRANULARITY_SECONDS = 180;
const MAX_DAYS = 21; // keeps request count (and run time) reasonable — each extra ~2 days is one more paginated request

// POST /api/backtest/run  { symbol, days?, confirmThreshold? }
async function run(req, res, next) {
  try {
    const { symbol = 'R_10', days = 2, confirmThreshold = 65 } = req.body;
    if (!isValidSymbol(symbol)) return res.status(400).json({ error: 'invalid symbol' });
    if (!isNumberInRange(confirmThreshold, 0, 100)) {
      return res.status(400).json({ error: 'confirmThreshold must be between 0 and 100' });
    }
    const requestedDays = Math.min(Math.max(Number(days) || 2, 1), MAX_DAYS);

    const candles = await derivService.getExtendedCandles(symbol, {
      days: requestedDays,
      granularity: GRANULARITY_SECONDS
    });

    const result = runBacktest(candles, { confirmThreshold: Number(confirmThreshold) });

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

    res.status(201).json({ ...result, _id: saved._id, symbol, requestedDays, maxDays: MAX_DAYS });
  } catch (err) {
    next(err);
  }
}

// GET /api/backtest/report/:id
async function report(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'invalid backtest id' });
    }
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
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const backtests = await Backtest.find().sort({ createdAt: -1 }).limit(safeLimit);
    res.status(200).json(backtests);
  } catch (err) {
    next(err);
  }
}

module.exports = { run, report, history };
