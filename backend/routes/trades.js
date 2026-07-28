const express = require('express');
const { history, stats, dailySummary } = require('../controllers/tradeController');

const router = express.Router();

router.get('/history', history);
router.get('/stats', stats);
router.get('/daily-summary', dailySummary);

module.exports = router;
