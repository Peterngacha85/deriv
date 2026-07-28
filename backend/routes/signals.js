const express = require('express');
const { latest, history, manual } = require('../controllers/signalController');

const router = express.Router();

router.get('/latest', latest);
router.get('/history', history);
router.post('/manual', manual);

module.exports = router;
