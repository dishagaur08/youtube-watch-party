const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  type: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video',
  },
  status: {
    type: String,
    enum: ['initiating', 'ringing', 'accepted', 'rejected', 'missed', 'ended'],
    default: 'initiating',
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  duration: {
    type: Number,
    default: 0,
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: Date,
    leftAt: Date,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Call', callSchema);
