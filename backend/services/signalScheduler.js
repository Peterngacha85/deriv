const EventEmitter = require('events');
const derivService = require('./derivService');
const volatilityAnalyzer = require('./volatilityAnalyzer');
const tradeTracker = require('./tradeTracker');
const settingsService = require('./settingsService');
const { generateSignal } = require('./signalEngine');
const { analyzeDigits } = require('./digitAnalyzer');
const Signal = require('../models/Signal');
const logger = require('../utils/logger');

const CANDLE_GRANULARITY_SECONDS = 180; // 3-minute candles, per spec
const CANDLE_COUNT = 100; // enough history for MA(50) + a margin
const EVALUATE_INTERVAL_MS = 60000;

class SignalScheduler extends EventEmitter {
  constructor() {
    super();
    this.latestSignals = new Map(); // symbol -> signal object
    this.latestDigits = new Map(); // symbol -> digit analysis
    this.timer = null;
  }

  start(symbols) {
    this.symbols = symbols;
    this._tick(); // run once immediately rather than waiting a full interval
    this.timer = setInterval(() => this._tick(), EVALUATE_INTERVAL_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async _tick() {
    for (const symbol of this.symbols) {
      try {
        await this._evaluateSymbol(symbol);
      } catch (err) {
        logger.error(`Signal evaluation failed for ${symbol}: ${err.message}`);
      }
    }
    try {
      await tradeTracker.sweepExpired();
    } catch (err) {
      logger.error(`Trade expiry sweep failed: ${err.message}`);
    }
  }

  async _evaluateSymbol(symbol) {
    const { candles } = await derivService.getCandles(symbol, {
      count: CANDLE_COUNT,
      granularity: CANDLE_GRANULARITY_SECONDS
    });
    if (!candles || candles.length === 0) return;

    volatilityAnalyzer.update(symbol, candles);

    const digitAnalysis = analyzeDigits(
      candles.map((c) => c.close),
      { threshold: 5 }
    );
    this.latestDigits.set(symbol, digitAnalysis);

    const { confirmThreshold } = settingsService.get();
    const signal = generateSignal(candles, { confirmThreshold });
    if (!signal) return;

    this.latestSignals.set(symbol, { symbol, ...signal });
    this.emit('signal', { symbol, ...signal });

    if (signal.type !== 'HOLD') {
      logger.info(`Signal ${symbol}: ${signal.type} @ ${signal.priceAtSignal} (confidence ${signal.confidence}%)`);
    }

    const signalDoc = await Signal.create({
      symbol,
      timestamp: signal.timestamp,
      type: signal.type,
      confidence: signal.confidence,
      priceAtSignal: signal.priceAtSignal,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      directionScore: signal.directionScore,
      volatilityScore: signal.volatilityScore,
      momentumScore: signal.momentumScore
    });

    // Only act on a fresh BUY/SELL if this symbol doesn't already have an
    // open simulated position — avoids stacking a new trade every cycle
    // while the same setup is still playing out — and if today's trade
    // count hasn't already hit the configured daily cap.
    if (signal.type !== 'HOLD' && !tradeTracker.hasOpenPosition(symbol)) {
      const { maxTradesPerDay } = settingsService.get();
      if (await tradeTracker.todaysTradeCount() < maxTradesPerDay) {
        await tradeTracker.openFromSignal(signalDoc);
      }
    }
  }

  getLatestSignal(symbol) {
    return this.latestSignals.get(symbol) || null;
  }

  getAllLatestSignals() {
    return Array.from(this.latestSignals.values());
  }

  getLatestDigits(symbol) {
    return this.latestDigits.get(symbol) || null;
  }
}

module.exports = new SignalScheduler();
