const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, streamController.listStreams);
router.get('/:streamId', optionalAuth, streamController.getStreamById);
router.post('/', authenticate, streamController.createStream);
router.post('/:streamId/end', authenticate, streamController.endStream);

module.exports = router;
