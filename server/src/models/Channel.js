const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement'],
    default: 'text',
  },
  topic: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  position: {
    type: Number,
    default: 0,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Channel', channelSchema);
