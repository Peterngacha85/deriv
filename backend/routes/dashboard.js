const express = require('express');
const { snapshot } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/snapshot', snapshot);

module.exports = router;
