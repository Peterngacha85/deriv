const EventEmitter = require('events');
const Signal = require('../models/Signal');
const Trade = require('../models/Trade');
const derivService = require('./derivService');
const logger = require('../utils/logger');

// Nominal dollars risked per trade (lost in full if the stop is hit) — this
// is a simulated/paper-trade tracker (it watches whether live price would
// have hit SL or TP), not real order placement on Deriv. P&L is expressed
// as a fraction of this risk amount, scaled by the trade's R:R ratio, so
// it stays meaningful regardless of a symbol's absolute price scale.
const NOMINAL_RISK = 10;
const MAX_TRADE_DURATION_MS = 30 * 60 * 1000; // force-resolve after 30 minutes

class TradeTracker extends EventEmitter {
  constructor() {
    super();
    this.openPositions = new Map(); // symbol -> array of open position objects
  }

  /** Opens a simulated position for a non-HOLD signal that was just persisted. */
  async openFromSignal(signalDoc) {
    if (signalDoc.type === 'HOLD') return;

    await Trade.create({
      clientId: signalDoc.clientId,
      signalId: signalDoc._id,
      symbol: signalDoc.symbol,
      entryPrice: signalDoc.priceAtSignal,
      timestamp: signalDoc.timestamp,
      result: 'OPEN'
    });

    const position = {
      signalId: signalDoc._id,
      symbol: signalDoc.symbol,
      type: signalDoc.type,
      entryPrice: signalDoc.priceAtSignal,
      stopLoss: signalDoc.stopLoss,
      takeProfit: signalDoc.takeProfit,
      openedAt: signalDoc.timestamp
    };

    const list = this.openPositions.get(signalDoc.symbol) || [];
    list.push(position);
    this.openPositions.set(signalDoc.symbol, list);

    logger.info(`Opened simulated ${position.type} trade on ${position.symbol} @ ${position.entryPrice}`);
  }

  hasOpenPosition(symbol) {
    return (this.openPositions.get(symbol) || []).length > 0;
  }

  /**
   * Rebuilds in-memory open positions from the database — must be called once
   * at startup. Without this, a restart forgets every open position (the guard
   * in openFromSignal would then think a symbol is free and stack duplicate
   * trades on top of ones that are still genuinely open).
   */
  async rehydrate() {
    const openTrades = await Trade.find({ result: 'OPEN' }).populate('signalId');
    let count = 0;
    for (const trade of openTrades) {
      const signal = trade.signalId; // populated Signal doc, or null if it was ever deleted
      if (!signal) continue;

      const position = {
        signalId: signal._id,
        symbol: trade.symbol,
        type: signal.type,
        entryPrice: trade.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        openedAt: trade.timestamp
      };
      const list = this.openPositions.get(trade.symbol) || [];
      list.push(position);
      this.openPositions.set(trade.symbol, list);
      count++;
    }
    if (count > 0) logger.info(`Rehydrated ${count} open position(s) from the database`);
  }

  /** Call on every live tick — resolves any open position on that symbol whose SL/TP was hit. */
  async onTick(tick) {
    const list = this.openPositions.get(tick.symbol);
    if (!list || list.length === 0) return;

    const stillOpen = [];
    for (const position of list) {
      const hit = this._checkHit(position, tick.quote);
      if (hit) {
        await this._resolve(position, tick.quote, hit);
      } else {
        stillOpen.push(position);
      }
    }
    this.openPositions.set(tick.symbol, stillOpen);
  }

  /** Call periodically — force-resolves positions that have been open too long. */
  async sweepExpired() {
    const now = Date.now();
    for (const [symbol, list] of this.openPositions.entries()) {
      const stillOpen = [];
      for (const position of list) {
        if (now - new Date(position.openedAt).getTime() > MAX_TRADE_DURATION_MS) {
          const latestTick = derivService.getLatestTick(symbol);
          const exitPrice = latestTick ? latestTick.quote : position.entryPrice;
          const direction = position.type === 'BUY' ? 1 : -1;
          const inProfit = (exitPrice - position.entryPrice) * direction > 0;
          await this._resolve(position, exitPrice, inProfit ? 'WON' : 'LOST', { partial: true });
        } else {
          stillOpen.push(position);
        }
      }
      this.openPositions.set(symbol, stillOpen);
    }
  }

  _checkHit(position, price) {
    const { type, stopLoss, takeProfit } = position;
    if (type === 'BUY') {
      if (price >= takeProfit) return 'WON';
      if (price <= stopLoss) return 'LOST';
    } else if (type === 'SELL') {
      if (price <= takeProfit) return 'WON';
      if (price >= stopLoss) return 'LOST';
    }
    return null;
  }

  async _resolve(position, exitPrice, result, { partial = false } = {}) {
    const direction = position.type === 'BUY' ? 1 : -1;
    const distanceToStop = Math.abs(position.entryPrice - position.stopLoss) || 1;
    const distanceToTarget = Math.abs(position.takeProfit - position.entryPrice);
    const rewardMultiple = distanceToTarget / distanceToStop;

    let pnl;
    if (!partial) {
      // A clean SL/TP hit — full risk lost, or full reward per the trade's R:R ratio
      pnl = result === 'WON' ? NOMINAL_RISK * rewardMultiple : -NOMINAL_RISK;
    } else {
      // Expired without hitting either level — scale by how far price actually moved
      const priceMoved = (exitPrice - position.entryPrice) * direction;
      const riskMultiple = Math.max(-1, Math.min(rewardMultiple, priceMoved / distanceToStop));
      pnl = NOMINAL_RISK * riskMultiple;
    }
    pnl = Math.round(pnl * 100) / 100;

    const durationMs = Date.now() - new Date(position.openedAt).getTime();
    const durationMin = Math.max(1, Math.round(durationMs / 60000));

    await Trade.findOneAndUpdate(
      { signalId: position.signalId },
      { exitPrice, pnl, result, duration: `${durationMin}m` }
    );

    await Signal.findByIdAndUpdate(position.signalId, { status: result, outcome: result, pnl });

    logger.info(`Trade resolved: ${position.symbol} ${position.type} ${result} (pnl ${pnl >= 0 ? '+' : ''}${pnl})`);
    this.emit('resolved', { ...position, exitPrice, result, pnl });
  }
}

module.exports = new TradeTracker();
