/**
 * Shared P&L model for both the live (simulated) trade tracker and the
 * backtesting engine — they must use identical math, since the spec calls
 * for comparing live performance against backtest results.
 *
 * Risks a fixed nominal amount per trade (lost in full if the stop is hit);
 * reward on a clean take-profit hit scales by the trade's own R:R ratio.
 * This stays meaningful regardless of a symbol's absolute price scale.
 */
const NOMINAL_RISK = 10;

/**
 * @param {'BUY'|'SELL'} type
 * @param {number} entryPrice
 * @param {number} stopLoss
 * @param {number} takeProfit
 * @param {number} exitPrice
 * @param {'WON'|'LOST'} result
 * @param {boolean} partial - true if this was a timeout/expiry close rather than a clean SL/TP hit
 */
function calculatePnl({ type, entryPrice, stopLoss, takeProfit, exitPrice, result, partial = false }) {
  const direction = type === 'BUY' ? 1 : -1;
  const distanceToStop = Math.abs(entryPrice - stopLoss) || 1;
  const distanceToTarget = Math.abs(takeProfit - entryPrice);
  const rewardMultiple = distanceToTarget / distanceToStop;

  let pnl;
  if (!partial) {
    pnl = result === 'WON' ? NOMINAL_RISK * rewardMultiple : -NOMINAL_RISK;
  } else {
    const priceMoved = (exitPrice - entryPrice) * direction;
    const riskMultiple = Math.max(-1, Math.min(rewardMultiple, priceMoved / distanceToStop));
    pnl = NOMINAL_RISK * riskMultiple;
  }
  return Math.round(pnl * 100) / 100;
}

module.exports = { calculatePnl, NOMINAL_RISK };
