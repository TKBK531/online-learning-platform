const express = require('express');
const path = require('path');
const router = express.Router();

const geminiController = require('../controllers/geminiController');
const { authenticated } = require('../utils/roleBasedAuth');

router.get('/usage', authenticated, geminiController.getApiUsage);
router.post('/generate', authenticated, geminiController.generateResponse);

module.exports = router;