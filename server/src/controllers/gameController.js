const store = require('../utils/store');
const chessEngine = require('../services/gameEngines/chessEngine');
const ticTacToeEngine = require('../services/gameEngines/ticTacToeEngine');
const rpsEngine = require('../services/gameEngines/rpsEngine');
const quizEngine = require('../services/gameEngines/quizEngine');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Create Game Room
const createGameRoom = async (req, res) => {
  try {
    const hostId = req.user._id || req.user.id;
    const { gameType } = req.body;

    if (!['chess', 'tictactoe', 'rps', 'quiz'].includes(gameType)) {
      return res.status(400).json({ success: false, message: 'Invalid game type' });
    }

    const roomId = 'room_' + gameType + '_' + Math.random().toString(36).substring(2, 7);

    // Initialize engine state
    let initialState = {};
    if (gameType === 'chess') initialState = chessEngine.createGame(roomId);
    if (gameType === 'tictactoe') initialState = ticTacToeEngine.createGame(roomId);
    if (gameType === 'rps') initialState = rpsEngine.createGame(roomId);
    if (gameType === 'quiz') initialState = quizEngine.createGame(roomId);

    const room = {
      _id: roomId,
      roomId,
      gameType,
      host: hostId,
      players: [{ user: hostId, role: gameType === 'chess' ? 'white' : 'X', score: 0, ready: true }],
      spectators: [],
      status: 'waiting',
      gameState: initialState,
      moves: [],
      createdAt: new Date(),
    };

    store.gameRooms.set(roomId, room);

    res.status(201).json({
      success: true,
      data: {
        ...room,
        hostDetail: sanitizeUser(store.users.get(hostId)),
        playerDetails: room.players.map(p => ({ ...p, userDetail: sanitizeUser(store.users.get(p.user)) })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Game Room
const getGameRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = store.gameRooms.get(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Game room not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...room,
        hostDetail: sanitizeUser(store.users.get(room.host)),
        playerDetails: room.players.map(p => ({ ...p, userDetail: sanitizeUser(store.users.get(p.user)) })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Global & Friends Leaderboards
const getLeaderboard = async (req, res) => {
  try {
    const statsList = Array.from(store.gameStats.values()).map(s => ({
      ...s,
      userDetail: sanitizeUser(store.users.get(s.user)),
    })).sort((a, b) => b.rating - a.rating);

    res.status(200).json({ success: true, data: statsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Stats
const getUserStats = async (req, res) => {
  try {
    const targetUserId = req.params.userId || (req.user._id || req.user.id);
    let stats = store.gameStats.get(targetUserId);

    if (!stats) {
      stats = {
        user: targetUserId,
        rating: 1200,
        totalPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        gameSpecific: {
          chess: { played: 0, wins: 0 },
          tictactoe: { played: 0, wins: 0 },
          rps: { played: 0, wins: 0 },
          quiz: { played: 0, wins: 0 },
        },
        achievements: [],
      };
      store.gameStats.set(targetUserId, stats);
    }

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        userDetail: sanitizeUser(store.users.get(targetUserId)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGameRoom,
  getGameRoom,
  getLeaderboard,
  getUserStats,
};
