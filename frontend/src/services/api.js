import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL, timeout: 15000 });

export const getDashboardSnapshot = () => client.get('/dashboard/snapshot').then((r) => r.data);

export const getSignalHistory = (params = {}) => client.get('/signals/history', { params }).then((r) => r.data);

export const getChart = (symbol, minutes = 100) =>
  client.get('/market/chart', { params: { symbol, minutes } }).then((r) => r.data);

export const getDigits = (market) => client.get('/market/digits', { params: { market } }).then((r) => r.data);

export const getTradeHistory = (params = {}) => client.get('/trades/history', { params }).then((r) => r.data);

export const getTradeStats = () => client.get('/trades/stats').then((r) => r.data);

export default client;
