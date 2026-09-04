const express = require('express');
const { handleBotpressWebhook, handleN8nWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/botpress', handleBotpressWebhook);
router.post('/n8n', handleN8nWebhook);

module.exports = router;
