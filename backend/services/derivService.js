const EventEmitter = require('events');
const DerivSocket = require('./derivSocket');
const derivRest = require('./derivRest');
const config = require('../config/deriv');
const logger = require('../utils/logger');

class DerivService extends EventEmitter {
  constructor() {
    super();
    this.public = new DerivSocket('deriv:public');
    this.account = new DerivSocket('deriv:account');

    this.latestTicks = new Map(); // symbol -> last tick payload
    this.subscriptions = new Set();
    this.activeAccount = null; // { account_id, balance, currency, account_type, ... }
    this.latestBalance = null;

    this._wirePublic();
    this._wireAccount();
  }

  // ---- Public (market data) socket — no authentication required ----

  connectPublic() {
    if (!config.appId) {
      logger.error('DERIV_APP_ID is not set — cannot connect to Deriv. Register an app at developers.deriv.com/dashboard');
      return;
    }
    const url = `${config.publicWsUrl}?app_id=${config.appId}`;
    this.public.connect(() => url, { headers: { 'Deriv-App-ID': config.appId } });
  }

  _wirePublic() {
    this.public.on('open', () => {
      // Snapshot before emitting 'connected' — listeners (e.g. server.js) may
      // call subscribeTicks() synchronously during the emit, which would
      // otherwise mutate this.subscriptions out from under this same loop.
      const toResubscribe = Array.from(this.subscriptions);
      this.emit('connected');
      for (const symbol of toResubscribe) this._sendTickSubscription(symbol);
    });
    this.public.on('message', (msg) => {
      switch (msg.msg_type) {
        case 'tick':
          this.latestTicks.set(msg.tick.symbol, msg.tick);
          this.emit('tick', msg.tick);
          break;
        case 'candles':
          this.emit('candles', msg);
          break;
        case 'ohlc':
          this.emit('ohlc', msg.ohlc);
          break;
        default:
          break;
      }
    });
    this.public.on('api-error', (error, msg) => {
      logger.error(`[deriv:public] API error [${msg.echo_req ? Object.keys(msg.echo_req)[0] : '?'}]: ${error.message}`);
    });
    this.public.on('close', () => this.emit('disconnected'));
  }

  subscribeTicks(symbol) {
    this.subscriptions.add(symbol);
    return this._sendTickSubscription(symbol);
  }

  _sendTickSubscription(symbol) {
    return this.public.send({ ticks: symbol, subscribe: 1 });
  }

  getCandles(symbol, { count = 100, granularity = 180 } = {}) {
    return this.public.request({
      ticks_history: symbol,
      adjust_start_time: 1,
      count,
      end: 'latest',
      style: 'candles',
      granularity
    });
  }

  getLatestTick(symbol) {
    return this.latestTicks.get(symbol) || null;
  }

  get isPublicConnected() {
    return this.public.isOpen;
  }

  // ---- Account socket — authenticated via REST-issued OTP, for balance/trading ----

  async connectAccount() {
    if (!config.apiToken) {
      logger.warn('DERIV_API_TOKEN is not set — skipping authenticated account connection.');
      return;
    }
    try {
      const accounts = await derivRest.getAccounts();
      const account =
        accounts.find((a) => a.account_type === config.accountType && a.status === 'active') || accounts[0];
      if (!account) {
        logger.warn('No Deriv accounts returned for this token.');
        return;
      }
      this.activeAccount = account;
      logger.info(`Selected Deriv account ${account.account_id} (${account.account_type}, ${account.currency})`);

      this.account.connect(async () => {
        // OTP URLs are single-use, so re-fetch a fresh one on every (re)connect.
        return derivRest.getAccountStreamUrl(account.account_id);
      });
    } catch (err) {
      logger.error(`Failed to set up authenticated Deriv account stream: ${err.message}`);
    }
  }

  _wireAccount() {
    this.account.on('open', () => {
      this.emit('account-connected', this.activeAccount);
      this.account.send({ balance: 1, subscribe: 1 });
    });
    this.account.on('message', (msg) => {
      if (msg.msg_type === 'balance') {
        this.latestBalance = msg.balance;
        this.emit('balance', msg.balance);
      }
    });
    this.account.on('api-error', (error, msg) => {
      logger.error(`[deriv:account] API error [${msg.echo_req ? Object.keys(msg.echo_req)[0] : '?'}]: ${error.message}`);
    });
    this.account.on('close', () => this.emit('account-disconnected'));
  }

  get isAccountConnected() {
    return this.account.isOpen;
  }
}

module.exports = new DerivService();
