const WebSocket = require('ws');
const EventEmitter = require('events');
const logger = require('../utils/logger');
const { reconnect: reconnectConfig } = require('../config/deriv');

const PING_INTERVAL_MS = 30000;

/**
 * Low-level wrapper around a single Deriv WebSocket connection: handles
 * reconnect with backoff, keepalive ping, and req_id-based request/response
 * correlation. Used for both the public (market data) and account
 * (authenticated) sockets, which speak the same message protocol.
 */
class DerivSocket extends EventEmitter {
  constructor(label) {
    super();
    this.label = label;
    this.ws = null;
    this.isConnecting = false;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.pingTimer = null;
    this.reqIdCounter = 1;
    this.pendingByReqId = new Map();
  }

  /** getUrl is called fresh on every (re)connect — needed since OTP URLs are single-use. */
  connect(getUrl, wsOptions = {}) {
    this.getUrl = getUrl;
    this.wsOptions = wsOptions;
    this.shouldReconnect = true;
    this._open();
  }

  async _open() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;
    this.isConnecting = true;

    let url;
    try {
      url = await this.getUrl();
    } catch (err) {
      this.isConnecting = false;
      logger.error(`[${this.label}] failed to resolve connection URL: ${err.message}`);
      this._scheduleReconnect();
      return;
    }

    logger.info(`[${this.label}] connecting...`);
    this.ws = new WebSocket(url, this.wsOptions);
    this.ws.on('open', () => this._onOpen());
    this.ws.on('message', (data) => this._onMessage(data));
    this.ws.on('close', (code, reason) => this._onClose(code, reason));
    this.ws.on('error', (err) => this._onError(err));
  }

  disconnect() {
    this.shouldReconnect = false;
    this._clearPing();
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

  _onOpen() {
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    logger.info(`[${this.label}] connected`);
    this._startPing();
    this.emit('open');
  }

  _onMessage(raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (err) {
      logger.error(`[${this.label}] failed to parse message: ${err.message}`);
      return;
    }

    if (msg.error) {
      this.emit('api-error', msg.error, msg);
      this._settlePending(msg.req_id, null, msg.error);
      return;
    }

    this.emit('message', msg);
    this._settlePending(msg.req_id, msg, null);
  }

  _onClose(code, reason) {
    this.isConnecting = false;
    this._clearPing();
    this.emit('close', { code, reason: reason?.toString() });
    if (this.shouldReconnect) {
      logger.warn(`[${this.label}] closed (code=${code}). Reconnecting...`);
      this._scheduleReconnect();
    }
  }

  _onError(err) {
    logger.error(`[${this.label}] error: ${err.message}`);
    this.emit('ws-error', err);
  }

  _scheduleReconnect() {
    const { initialDelayMs, maxDelayMs, backoffFactor } = reconnectConfig;
    const delay = Math.min(initialDelayMs * backoffFactor ** this.reconnectAttempts, maxDelayMs);
    this.reconnectAttempts += 1;
    setTimeout(() => this._open(), delay);
  }

  _startPing() {
    this._clearPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) this.send({ ping: 1 });
    }, PING_INTERVAL_MS);
  }

  _clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  get isOpen() {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  send(payload) {
    if (!this.isOpen) {
      logger.warn(`[${this.label}] cannot send, socket not open`);
      return null;
    }
    const req_id = this.reqIdCounter++;
    this.ws.send(JSON.stringify({ ...payload, req_id }));
    return req_id;
  }

  request(payload, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const req_id = this.send(payload);
      if (req_id === null) {
        reject(new Error(`[${this.label}] socket not connected`));
        return;
      }
      const timer = setTimeout(() => {
        this.pendingByReqId.delete(req_id);
        reject(new Error(`[${this.label}] request timed out`));
      }, timeoutMs);
      this.pendingByReqId.set(req_id, { resolve, reject, timer });
    });
  }

  _settlePending(req_id, result, error) {
    if (req_id === undefined) return;
    const pending = this.pendingByReqId.get(req_id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pendingByReqId.delete(req_id);
    if (error) pending.reject(new Error(error.message));
    else pending.resolve(result);
  }
}

module.exports = DerivSocket;
