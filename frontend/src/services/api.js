import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL, timeout: 15000 });

export const getDashboardSnapshot = () => client.get('/dashboard/snapshot').then((r) => r.data);

export const getSignalHistory = (params = {}) => client.get('/signals/history', { params }).then((r) => r.data);

export const getChart = (symbol, minutes = 100) =>
  client.get('/market/chart', { params: { symbol, minutes } }).then((r) => r.data);

export const getDigits = (market) => client.get('/market/digits', { params: { market } }).then((r) => r.data);

export const getLatestTick = (symbol) => client.get(`/market/tick/${symbol}`).then((r) => r.data);

export const subscribeSymbol = (symbol) => client.post('/market/subscribe', { symbol }).then((r) => r.data);

export const getTradeHistory = (params = {}) => client.get('/trades/history', { params }).then((r) => r.data);

export const getTradeStats = () => client.get('/trades/stats').then((r) => r.data);

// Longer timeout: multi-week runs page through several sequential Deriv requests
export const runBacktest = (params) => client.post('/backtest/run', params, { timeout: 60000 }).then((r) => r.data);

export const getBacktestHistory = (params = {}) => client.get('/backtest/history', { params }).then((r) => r.data);

export const getSettings = () => client.get('/settings').then((r) => r.data);

export const updateSettings = (patch) => client.put('/settings', patch).then((r) => r.data);

export default client;
