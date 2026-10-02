const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['user', 'message', 'stream', 'community'],
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'hate_speech', 'inappropriate_content', 'cheating', 'impersonation', 'other'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionNotes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
