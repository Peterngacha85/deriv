const Settings = require('../models/Settings');
const logger = require('../utils/logger');

// Single-tenant: there is exactly one settings document, matched by an
// empty filter rather than a clientId.
const DEFAULTS = {
  slippagePercentage: 0.5,
  commissionPercentage: 0.1,
  maxTradesPerDay: 50,
  confirmThreshold: 65,
  riskPercentage: 2,
  timeframe: '3m'
};

class SettingsService {
  constructor() {
    this.cached = { ...DEFAULTS };
  }

  async load() {
    let doc = await Settings.findOne();
    if (!doc) {
      doc = await Settings.create(DEFAULTS);
      logger.info('Created default Settings document');
    }
    this.cached = doc.toObject();
    return this.cached;
  }

  get() {
    return this.cached;
  }

  async update(patch) {
    const allowed = ['slippagePercentage', 'commissionPercentage', 'maxTradesPerDay', 'confirmThreshold', 'riskPercentage'];
    const update = {};
    for (const key of allowed) {
      if (patch[key] !== undefined) update[key] = patch[key];
    }

    const doc = await Settings.findOneAndUpdate({}, update, { new: true, upsert: true });
    this.cached = doc.toObject();
    logger.info(`Settings updated: ${JSON.stringify(update)}`);
    return this.cached;
  }
}

module.exports = new SettingsService();
