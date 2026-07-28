const express = require('express');
const { run, report, history } = require('../controllers/backtestController');

const router = express.Router();

router.post('/run', run);
router.get('/report/:id', report);
router.get('/history', history);

module.exports = router;
