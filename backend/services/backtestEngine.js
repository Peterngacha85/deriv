const { generateSignal } = require('./signalEngine');
const { calculatePnl } = require('../utils/pnl');

const MIN_HISTORY_CANDLES = 51; // matches signalEngine's MA(50) requirement

/**
 * Replays a symbol's own signal engine over historical candles, one candle
 * at a time, using only data available up to that point (no lookahead) —
 * exactly mirroring how the live scheduler evaluates signals every 3
 * minutes. Opens at most one position at a time per run, same as the live
 * tracker's one-open-position-per-symbol rule, so results are comparable.
 *
 * @param {Array} candles - oldest -> newest, { open, high, low, close, epoch }
 */
function runBacktest(candles, { confirmThreshold = 65 } = {}) {
  if (!candles || candles.length < MIN_HISTORY_CANDLES) {
    throw new Error(`Need at least ${MIN_HISTORY_CANDLES} candles to backtest, got ${candles?.length || 0}`);
  }

  const trades = [];
  let openPosition = null;

  for (let i = MIN_HISTORY_CANDLES - 1; i < candles.length; i++) {
    const candle = candles[i];

    if (openPosition) {
      const hit = checkHit(openPosition, candle);
      if (hit) {
        trades.push(closeTrade(openPosition, hit.exitPrice, hit.result, candle.epoch));
        openPosition = null;
      }
      continue; // a candle that closes a position doesn't also open a new one
    }

    const windowCandles = candles.slice(0, i + 1);
    const signal = generateSignal(windowCandles, { confirmThreshold });
    if (signal && signal.type !== 'HOLD') {
      openPosition = {
        type: signal.type,
        entryPrice: signal.priceAtSignal,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        openedAtEpoch: candle.epoch
      };
    }
  }

  // Data ran out with a position still open — close it at the last known price
  if (openPosition) {
    const lastCandle = candles[candles.length - 1];
    const direction = openPosition.type === 'BUY' ? 1 : -1;
    const inProfit = (lastCandle.close - openPosition.entryPrice) * direction > 0;
    trades.push(closeTrade(openPosition, lastCandle.close, inProfit ? 'WON' : 'LOST', lastCandle.epoch, true));
  }

  return summarize(trades, candles);
}

function checkHit(position, candle) {
  const { type, stopLoss, takeProfit } = position;
  if (type === 'BUY') {
    // Conservative convention when a single candle's range spans both levels: assume the stop hit first.
    if (candle.low <= stopLoss) return { result: 'LOST', exitPrice: stopLoss };
    if (candle.high >= takeProfit) return { result: 'WON', exitPrice: takeProfit };
  } else {
    if (candle.high >= stopLoss) return { result: 'LOST', exitPrice: stopLoss };
    if (candle.low <= takeProfit) return { result: 'WON', exitPrice: takeProfit };
  }
  return null;
}

function closeTrade(position, exitPrice, result, exitEpoch, partial = false) {
  const pnl = calculatePnl({ ...position, exitPrice, result, partial });
  return {
    type: position.type,
    entryPrice: position.entryPrice,
    exitPrice,
    stopLoss: position.stopLoss,
    takeProfit: position.takeProfit,
    result,
    pnl,
    openedAtEpoch: position.openedAtEpoch,
    closedAtEpoch: exitEpoch
  };
}

function summarize(trades, candles) {
  const wins = trades.filter((t) => t.result === 'WON');
  const losses = trades.filter((t) => t.result === 'LOST');
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

  // Max drawdown: largest peak-to-trough decline in cumulative P&L across the run
  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  trades.forEach((t) => {
    equity += t.pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  });

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? Math.round((wins.length / totalTrades) * 1000) / 10 : 0;
  const avgProfit = wins.length > 0 ? Math.round((grossProfit / wins.length) * 100) / 100 : 0;
  const avgLoss = losses.length > 0 ? Math.round((-grossLoss / losses.length) * 100) / 100 : 0;
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : null;
  const totalProfit = Math.round((grossProfit - grossLoss) * 100) / 100;

  let recommendation;
  if (totalTrades < 10) {
    recommendation = 'Too few trades in this data range to draw a reliable conclusion — try a longer range.';
  } else if (winRate >= 65) {
    recommendation = `Win rate (${winRate}%) meets the 65%+ target from the spec. Profit factor ${profitFactor ?? '∞'}.`;
  } else {
    recommendation = `Win rate (${winRate}%) is below the 65% target — consider raising the confidence threshold or reviewing indicator periods.`;
  }

  return {
    dataRange: { from: new Date(candles[0].epoch * 1000), to: new Date(candles[candles.length - 1].epoch * 1000) },
    totalTrades,
    winCount: wins.length,
    lossCount: losses.length,
    winRate,
    avgProfit,
    avgLoss,
    profitFactor,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    totalProfit,
    recommendation,
    trades
  };
}

module.exports = { runBacktest };
