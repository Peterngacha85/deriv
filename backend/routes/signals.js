const express = require('express');
const { latest, history, manual } = require('../controllers/signalController');
const { writeLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/latest', latest);
router.get('/history', history);
router.post('/manual', writeLimiter, manual);

module.exports = router;
