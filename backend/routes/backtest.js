const express = require('express');
const { run, report, history } = require('../controllers/backtestController');
const { backtestLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/run', backtestLimiter, run);
router.get('/report/:id', report);
router.get('/history', history);

module.exports = router;
