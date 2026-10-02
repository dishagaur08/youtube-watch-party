const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New AI Chat',
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    citations: [mongoose.Schema.Types.Mixed],
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('AIConversation', aiConversationSchema);
