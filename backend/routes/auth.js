const express = require('express');
const { connect, verify } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/connect', authLimiter, connect);
router.get('/verify', verify);

module.exports = router;
