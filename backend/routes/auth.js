const express = require('express');
const { connect, verify } = require('../controllers/authController');

const router = express.Router();

router.post('/connect', connect);
router.get('/verify', verify);

module.exports = router;
