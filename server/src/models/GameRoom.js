const mongoose = require('mongoose');

const gameRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  gameType: {
    type: String,
    enum: ['chess', 'tictactoe', 'rps', 'quiz'],
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String, // 'white'/'black', 'X'/'O', etc.
    score: { type: Number, default: 0 },
    ready: { type: Boolean, default: false },
  }],
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished', 'abandoned'],
    default: 'waiting',
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isDraw: {
    type: Boolean,
    default: false,
  },
  moves: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    move: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('GameRoom', gameRoomSchema);
