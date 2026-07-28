const Client = require('../models/Client');
const derivService = require('../services/derivService');
const { isValidEmail } = require('../utils/validators');
const logger = require('../utils/logger');

// POST /api/auth/connect
// Body: { email, apiToken, markets? }
async function connect(req, res, next) {
  try {
    const { email, apiToken, markets } = req.body;
    if (!email || !apiToken) {
      return res.status(400).json({ error: 'email and apiToken are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'email is not a valid email address' });
    }
    if (typeof apiToken !== 'string' || apiToken.length < 10 || apiToken.length > 200) {
      return res.status(400).json({ error: 'apiToken looks invalid' });
    }
    if (markets !== undefined && (!Array.isArray(markets) || markets.some((m) => typeof m !== 'string'))) {
      return res.status(400).json({ error: 'markets must be an array of strings' });
    }

    let client = await Client.findOne({ email: email.toLowerCase() });
    if (!client) {
      client = new Client({ email, apiToken: 'placeholder', markets: markets || [] });
    }
    client.setApiToken(apiToken);
    if (markets) client.markets = markets;
    await client.save();

    logger.info(`Stored Deriv API token for client ${client.email}`);

    res.status(200).json({
      message: 'Client credentials saved',
      client: { id: client._id, email: client.email, markets: client.markets }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/verify
function verify(req, res) {
  res.status(200).json({
    marketDataConnected: derivService.isPublicConnected,
    accountConnected: derivService.isAccountConnected,
    account: derivService.activeAccount
  });
}

module.exports = { connect, verify };
