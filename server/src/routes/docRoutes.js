const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', optionalAuth, upload.single('file'), docController.uploadDocument);
router.get('/', optionalAuth, docController.listDocuments);
router.post('/ask', optionalAuth, docController.askDocument);
router.delete('/:docId', optionalAuth, docController.deleteDocument);

module.exports = router;
