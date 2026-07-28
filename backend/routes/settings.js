const express = require('express');
const { get, update } = require('../controllers/settingsController');
const { settingsLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/', get);
router.put('/', settingsLimiter, update);

module.exports = router;
