const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text',
  },
  content: {
    type: String,
  },
  mediaUrl: {
    type: String,
  },
  background: {
    type: String,
    default: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  viewers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now },
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours
    index: { expires: 0 },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Story', storySchema);
