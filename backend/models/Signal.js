const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  symbol: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['BUY', 'SELL', 'HOLD'], required: true },
  confidence: { type: Number, required: true },
  priceAtSignal: { type: Number, required: true },
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  directionScore: { type: Number, required: true },
  volatilityScore: { type: Number, required: true },
  momentumScore: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'WON', 'LOST'], default: 'PENDING' },
  outcome: { type: String, enum: ['WON', 'LOST', null], default: null },
  pnl: { type: Number, default: null },
  notes: { type: String, default: '' }
});

signalSchema.index({ symbol: 1, timestamp: -1 });

module.exports = mongoose.model('Signal', signalSchema);
