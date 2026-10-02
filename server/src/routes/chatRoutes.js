const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/conversations', authenticate, chatController.getConversations);
router.post('/conversations/direct', authenticate, chatController.createOrGetDirectConversation);
router.post('/conversations/group', authenticate, chatController.createGroupConversation);
router.get('/conversations/:conversationId/messages', authenticate, chatController.getMessages);
router.post('/conversations/:conversationId/messages', authenticate, chatController.sendMessage);
router.post('/upload', authenticate, upload.single('file'), chatController.uploadFile);
router.post('/messages/:messageId/reactions', authenticate, chatController.addReaction);
router.post('/messages/:messageId/pin', authenticate, chatController.togglePinMessage);

module.exports = router;
