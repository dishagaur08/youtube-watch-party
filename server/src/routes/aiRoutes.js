const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/chat', optionalAuth, aiLimiter, aiController.chat);
router.post('/smart-replies', optionalAuth, aiLimiter, aiController.smartReplies);
router.post('/rewrite', optionalAuth, aiLimiter, aiController.rewrite);
router.post('/translate', optionalAuth, aiLimiter, aiController.translate);
router.post('/summarize', optionalAuth, aiLimiter, aiController.summarize);
router.post('/action-items', optionalAuth, aiLimiter, aiController.actionItems);
router.post('/transcribe', authenticate, upload.single('audio'), aiController.transcribe);

module.exports = router;
