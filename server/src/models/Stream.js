const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    default: 'Gaming',
    enum: ['Gaming', 'Tech & AI', 'Music', 'Just Chatting', 'Creative', 'Esports'],
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  },
  streamKey: {
    type: String,
    unique: true,
  },
  isLive: {
    type: Boolean,
    default: true,
  },
  viewerCount: {
    type: Number,
    default: 1,
  },
  peakViewers: {
    type: Number,
    default: 1,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  tags: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Stream', streamSchema);
