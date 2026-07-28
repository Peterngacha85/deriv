const mongoose = require('mongoose');

const backtestSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  symbol: { type: String, required: true },
  dataRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  totalTrades: { type: Number, default: 0 },
  winCount: { type: Number, default: 0 },
  lossCount: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  avgProfit: { type: Number, default: 0 },
  avgLoss: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  maxDrawdown: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  report: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Backtest', backtestSchema);
