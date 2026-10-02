const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
