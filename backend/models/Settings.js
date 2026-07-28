const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  slippagePercentage: { type: Number, default: 0.5 },
  commissionPercentage: { type: Number, default: 0.1 },
  maxTradesPerDay: { type: Number, default: 50 },
  confirmThreshold: { type: Number, default: 65 }, // Min confidence to generate a signal
  riskPercentage: { type: Number, default: 2 },
  timeframe: { type: String, default: '3m' }
});

module.exports = mongoose.model('Settings', settingsSchema);
