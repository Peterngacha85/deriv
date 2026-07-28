const derivService = require('../services/derivService');
const signalScheduler = require('../services/signalScheduler');
const volatilityAnalyzer = require('../services/volatilityAnalyzer');
const Trade = require('../models/Trade');
const config = require('../config/deriv');

// GET /api/dashboard/snapshot — everything the dashboard's first paint needs, in one call
async function snapshot(req, res, next) {
  try {
    const trades = await Trade.find({ result: { $ne: 'OPEN' } }).sort({ timestamp: 1 });
    const wins = trades.filter((t) => t.result === 'WON');
    const winRate = trades.length > 0 ? Math.round((wins.length / trades.length) * 1000) / 10 : 0;

    res.status(200).json({
      connection: {
        marketDataConnected: derivService.isPublicConnected,
        accountConnected: derivService.isAccountConnected
      },
      account: derivService.activeAccount,
      balance: derivService.latestBalance,
      symbols: config.defaultSymbols,
      signals: signalScheduler.getAllLatestSignals(),
      volatility: volatilityAnalyzer.getAllSnapshots(),
      tradeStats: {
        totalTrades: trades.length,
        winRate,
        totalPnl: Math.round(trades.reduce((sum, t) => sum + (t.pnl || 0), 0) * 100) / 100
      },
      recentTrades: trades.slice(-20).reverse()
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { snapshot };
