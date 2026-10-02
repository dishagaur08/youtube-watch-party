const express = require('express');
const router = express.Router();
const watchController = require('../controllers/watchController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/rooms', optionalAuth, watchController.listWatchRooms);
router.post('/rooms', authenticate, watchController.createWatchRoom);
router.get('/rooms/:roomId', optionalAuth, watchController.getWatchRoom);

module.exports = router;
