const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signal' },
  symbol: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  pnl: { type: Number },
  result: { type: String, enum: ['WON', 'LOST', 'OPEN'], default: 'OPEN' },
  timestamp: { type: Date, default: Date.now },
  duration: { type: String }
});

tradeSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
