require('dotenv').config();

module.exports = {
  // Registered application ID from developers.deriv.com/dashboard (Native app / PAT type).
  // The old shared numeric app_id (1089) is no longer accepted — see README notes.
  appId: process.env.DERIV_APP_ID || '',
  apiToken: process.env.DERIV_API_TOKEN || '',
  clientEmail: process.env.DERIV_CLIENT_EMAIL || '',

  restBaseUrl: 'https://api.derivws.com',
  publicWsUrl: process.env.DERIV_WS_URL || 'wss://api.derivws.com/trading/v1/options/ws/public',

  // Which account type to open the authenticated (balance/portfolio) socket against
  accountType: process.env.DERIV_ACCOUNT_TYPE || 'real', // 'real' | 'demo'

  // Symbols to stream on boot — verified valid against the live API
  defaultSymbols: ['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ100V'],

  reconnect: {
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2
  }
};
