const express = require('express');
const path = require('path');
const router = express.Router();

const gptController = require('../controllers/gptController');
const { authenticated } = require('../utils/roleBasedAuth');

router.get('/usage', authenticated, gptController.getApiUsage);
router.post('/generate', authenticated, gptController.generateResponse);
router.get('/history', authenticated, gptController.getChatHistory);

module.exports = router;