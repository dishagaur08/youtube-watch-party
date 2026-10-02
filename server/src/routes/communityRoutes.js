const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, communityController.listCommunities);
router.post('/', authenticate, communityController.createCommunity);
router.post('/:communityId/join', authenticate, communityController.joinCommunity);
router.get('/:communityId/channels', optionalAuth, communityController.getCommunityChannels);
router.post('/:communityId/channels', authenticate, communityController.createChannel);

module.exports = router;
