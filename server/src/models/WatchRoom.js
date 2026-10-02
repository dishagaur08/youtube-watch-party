const mongoose = require('mongoose');

const watchRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['video', 'youtube', 'audio', 'stream'],
    default: 'youtube',
  },
  mediaUrl: {
    type: String,
    default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  playbackState: {
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  queue: [{
    url: String,
    title: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('WatchRoom', watchRoomSchema);
