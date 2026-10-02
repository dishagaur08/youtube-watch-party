const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

router.get('/metrics', authenticate, requireAdmin, adminController.getMetrics);
router.get('/users', authenticate, requireAdmin, adminController.listUsers);
router.post('/users/:userId/ban', authenticate, requireAdmin, adminController.toggleBanUser);
router.get('/reports', authenticate, requireAdmin, adminController.listReports);
router.post('/reports/:reportId/resolve', authenticate, requireAdmin, adminController.resolveReport);
router.get('/audit-logs', authenticate, requireAdmin, adminController.listAuditLogs);

module.exports = router;
