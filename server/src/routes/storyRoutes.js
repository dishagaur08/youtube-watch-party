const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, storyController.getStories);
router.post('/', authenticate, storyController.createStory);

module.exports = router;
