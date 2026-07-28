const settingsService = require('../services/settingsService');

const BOUNDS = {
  confirmThreshold: [0, 100],
  riskPercentage: [0.1, 20],
  maxTradesPerDay: [1, 500],
  slippagePercentage: [0, 5],
  commissionPercentage: [0, 5]
};

function validate(patch) {
  for (const [key, [min, max]] of Object.entries(BOUNDS)) {
    if (patch[key] === undefined) continue;
    const value = Number(patch[key]);
    if (Number.isNaN(value) || value < min || value > max) {
      return `${key} must be a number between ${min} and ${max}`;
    }
  }
  return null;
}

// GET /api/settings
function get(req, res) {
  res.status(200).json(settingsService.get());
}

// PUT /api/settings
async function update(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const updated = await settingsService.update(req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
