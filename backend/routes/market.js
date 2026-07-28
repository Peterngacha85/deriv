const express = require('express');
const { status, latestTick, subscribe, chart, volatility, digits } = require('../controllers/marketController');
const { writeLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/status', status);
router.get('/tick/:symbol', latestTick);
router.post('/subscribe', writeLimiter, subscribe);
router.get('/chart', chart);
router.get('/volatility', volatility);
router.get('/digits', digits);

module.exports = router;
