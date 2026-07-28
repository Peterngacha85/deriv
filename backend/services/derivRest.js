const axios = require('axios');
const config = require('../config/deriv');

function client() {
  return axios.create({
    baseURL: config.restBaseUrl,
    headers: {
      'Deriv-App-ID': config.appId,
      Authorization: `Bearer ${config.apiToken}`
    },
    timeout: 10000
  });
}

/** List trading accounts (real + demo) available to the configured API token. */
async function getAccounts() {
  const { data } = await client().get('/trading/v1/options/accounts');
  return data.data; // [{ account_id, balance, currency, group, status, account_type }, ...]
}

/**
 * Exchange the bearer token for a short-lived, one-time WebSocket URL
 * scoped to a specific account (for balance/portfolio/trading streams).
 */
async function getAccountStreamUrl(accountId) {
  const { data } = await client().post(`/trading/v1/options/accounts/${accountId}/otp`);
  return data.data.url;
}

module.exports = { getAccounts, getAccountStreamUrl };
