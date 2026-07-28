const Trade = require('../models/Trade');

// GET /api/trades/history?limit=20
async function history(req, res, next) {
  try {
    const { limit = 20 } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);
    const trades = await Trade.find().sort({ timestamp: -1 }).limit(safeLimit);
    res.status(200).json(trades);
  } catch (err) {
    next(err);
  }
}

// GET /api/trades/stats — win rate, avg P&L, consecutive win/loss streaks
async function stats(req, res, next) {
  try {
    const trades = await Trade.find({ result: { $ne: 'OPEN' } }).sort({ timestamp: 1 });

    const total = trades.length;
    const wins = trades.filter((t) => t.result === 'WON');
    const losses = trades.filter((t) => t.result === 'LOST');
    const winRate = total > 0 ? Math.round((wins.length / total) * 1000) / 10 : 0;

    const avg = (arr) => (arr.length > 0 ? arr.reduce((sum, t) => sum + t.pnl, 0) / arr.length : 0);

    let currentStreak = 0;
    let currentStreakType = null;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let runningStreak = 0;
    let runningType = null;

    trades.forEach((t) => {
      if (t.result === runningType) {
        runningStreak++;
      } else {
        runningType = t.result;
        runningStreak = 1;
      }
      if (t.result === 'WON') longestWinStreak = Math.max(longestWinStreak, runningStreak);
      if (t.result === 'LOST') longestLossStreak = Math.max(longestLossStreak, runningStreak);
      currentStreak = runningStreak;
      currentStreakType = runningType;
    });

    res.status(200).json({
      totalTrades: total,
      wins: wins.length,
      losses: losses.length,
      winRate,
      avgProfit: Math.round(avg(wins) * 100) / 100,
      avgLoss: Math.round(avg(losses) * 100) / 100,
      totalPnl: Math.round(trades.reduce((sum, t) => sum + t.pnl, 0) * 100) / 100,
      currentStreak: { type: currentStreakType, count: currentStreak },
      longestWinStreak,
      longestLossStreak
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/trades/daily-summary
async function dailySummary(req, res, next) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const trades = await Trade.find({ timestamp: { $gte: startOfDay }, result: { $ne: 'OPEN' } });
    const wins = trades.filter((t) => t.result === 'WON').length;
    const losses = trades.filter((t) => t.result === 'LOST').length;
    const pnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    res.status(200).json({
      date: startOfDay.toISOString().slice(0, 10),
      totalTrades: trades.length,
      wins,
      losses,
      winRate: trades.length > 0 ? Math.round((wins / trades.length) * 1000) / 10 : 0,
      pnl: Math.round(pnl * 100) / 100
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { history, stats, dailySummary };
