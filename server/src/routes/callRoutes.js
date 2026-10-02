const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { authenticate } = require('../middleware/auth');

router.post('/initiate', authenticate, callController.initiateCall);
router.get('/history', authenticate, callController.getCallHistory);

module.exports = router;
