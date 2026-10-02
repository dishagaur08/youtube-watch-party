const mongoose = require('mongoose');

const gameStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  rating: {
    type: Number,
    default: 1200,
  },
  totalPlayed: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  gameSpecific: {
    chess: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    tictactoe: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    rps: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
    quiz: { played: { type: Number, default: 0 }, wins: { type: Number, default: 0 } },
  },
  achievements: [{
    id: String,
    title: String,
    unlockedAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('GameStats', gameStatsSchema);
