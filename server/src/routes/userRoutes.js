const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/search', authenticate, userController.searchUsers);
router.get('/friends', authenticate, userController.getFriends);
router.get('/:identifier', authenticate, userController.getUserProfile);
router.post('/friend-request', authenticate, userController.sendFriendRequest);
router.post('/follow/:targetUserId', authenticate, userController.toggleFollow);
router.post('/block/:targetUserId', authenticate, userController.toggleBlock);

module.exports = router;
