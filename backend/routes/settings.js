const express = require('express');
const { get, update } = require('../controllers/settingsController');

const router = express.Router();

router.get('/', get);
router.put('/', update);

module.exports = router;
