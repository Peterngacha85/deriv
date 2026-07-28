require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');
const derivConfig = require('./config/deriv');
const derivService = require('./services/derivService');
const signalScheduler = require('./services/signalScheduler');
const tradeTracker = require('./services/tradeTracker');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const signalRoutes = require('./routes/signals');
const tradeRoutes = require('./routes/trades');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-Origin requests (curl, server-to-server) and anything on the allowlist.
      const allowed = allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin);
      callback(null, allowed);
    }
  })
);
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ service: 'Deriv Analysis Tool API', status: 'running' });
});

// Temporary — remove once CORS is confirmed working in production
app.get('/api/debug/cors', (req, res) => {
  res.json({ allowedOrigins, receivedOrigin: req.headers.origin || null });
});

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  derivService.connectPublic();
  let schedulerStarted = false;
  derivService.on('connected', () => {
    // Subscribe to the default symbols once the market data socket is live
    derivConfig.defaultSymbols.forEach((symbol) => derivService.subscribeTicks(symbol));

    // Start the signal engine loop once, on first connection — getCandles()
    // works fine across reconnects since it's a fresh request each time.
    if (!schedulerStarted) {
      schedulerStarted = true;
      signalScheduler.start(derivConfig.defaultSymbols);
    }
  });
  derivService.on('tick', (tick) => {
    logger.info(`Tick ${tick.symbol}: ${tick.quote}`);
    tradeTracker.onTick(tick).catch((err) => logger.error(`Trade tracker tick handling failed: ${err.message}`));
  });

  derivService.connectAccount();
  derivService.on('account-connected', (account) => {
    logger.info(`Account stream connected: ${account.account_id} (${account.account_type})`);
  });
  derivService.on('balance', (balance) => {
    logger.info(`Balance: ${balance.balance} ${balance.currency}`);
  });

  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
