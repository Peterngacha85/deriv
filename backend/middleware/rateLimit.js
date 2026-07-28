const rateLimit = require('express-rate-limit');

function limiter(max, windowMinutes, message) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message || 'Too many requests — please slow down.' }
  });
}

// Generous default for read-heavy dashboard polling (multiple tabs, ~15-20 req/min each)
const generalLimiter = limiter(1000, 15);

// Tighter limits for expensive or write-sensitive endpoints
const backtestLimiter = limiter(10, 15, 'Too many backtest runs — please wait before running another.');
const authLimiter = limiter(5, 60, 'Too many connection attempts — please wait before retrying.');
const settingsLimiter = limiter(20, 15, 'Too many settings changes — please slow down.');
const writeLimiter = limiter(30, 15, 'Too many requests — please slow down.');

module.exports = { generalLimiter, backtestLimiter, authLimiter, settingsLimiter, writeLimiter };
