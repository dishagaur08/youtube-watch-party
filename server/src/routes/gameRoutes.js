const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.post('/rooms', authenticate, gameController.createGameRoom);
router.get('/rooms/:roomId', optionalAuth, gameController.getGameRoom);
router.get('/leaderboard', optionalAuth, gameController.getLeaderboard);
router.get('/stats/:userId?', authenticate, gameController.getUserStats);

module.exports = router;
