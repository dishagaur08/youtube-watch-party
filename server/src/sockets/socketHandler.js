const store = require('../utils/store');
const chessEngine = require('../services/gameEngines/chessEngine');
const ticTacToeEngine = require('../services/gameEngines/ticTacToeEngine');
const rpsEngine = require('../services/gameEngines/rpsEngine');
const quizEngine = require('../services/gameEngines/quizEngine');
const moderationService = require('../services/moderationService');
const registerWatchPartySockets = require('../services/watchParty/watchPartySockets');

const initSockets = (io) => {
  const onlineUsers = new Map(); // socketId -> userId
  const userSockets = new Map(); // userId -> Set of socketIds

  io.on('connection', (socket) => {
    // Register YouTube Watch Party Protocol Handlers
    registerWatchPartySockets(io, socket);
    // ----------------------------------------------------
    // PRESENCE
    // ----------------------------------------------------
    socket.on('user:online', ({ userId }) => {
      if (!userId) return;
      socket.userId = userId;
      onlineUsers.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      const user = store.users.get(userId);
      if (user) user.status = 'online';

      io.emit('presence:update', {
        userId,
        status: 'online',
        lastSeen: new Date(),
      });
    });

    socket.on('user:set-status', ({ userId, status, customStatus }) => {
      const user = store.users.get(userId);
      if (user) {
        if (status) user.status = status;
        if (customStatus !== undefined) user.customStatus = customStatus;
        io.emit('presence:update', {
          userId,
          status: user.status,
          customStatus: user.customStatus,
        });
      }
    });

    // ----------------------------------------------------
    // CHAT & MESSAGING
    // ----------------------------------------------------
    socket.on('chat:join', ({ conversationId }) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('chat:leave', ({ conversationId }) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('typing:start', ({ conversationId, userId, username }) => {
      socket.to(`conv_${conversationId}`).emit('typing:status', {
        conversationId,
        userId,
        username,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('typing:status', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    socket.on('message:send', async (messageData) => {
      const { conversationId, sender, content, type, mediaUrl, fileName, fileSize, audioDuration } = messageData;
      
      const modResult = await moderationService.filterContent(content || '');
      const cleanContent = modResult.sanitizedText || content;

      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newMsg = {
        _id: msgId,
        id: msgId,
        conversationId,
        sender,
        content: cleanContent,
        type: type || 'text',
        mediaUrl,
        fileName,
        fileSize,
        audioDuration,
        reactions: [],
        readBy: [{ user: sender, readAt: new Date() }],
        createdAt: new Date(),
      };

      store.messages.set(msgId, newMsg);

      const conv = store.conversations.get(conversationId);
      if (conv) {
        conv.lastMessage = msgId;
        conv.lastMessageAt = new Date();
      }

      const senderUser = store.users.get(sender);
      const payload = {
        ...newMsg,
        senderDetail: senderUser ? {
          _id: senderUser._id,
          username: senderUser.username,
          displayName: senderUser.displayName,
          avatar: senderUser.avatar,
        } : null,
      };

      io.to(`conv_${conversationId}`).emit('message:new', payload);
    });

    socket.on('message:react', ({ messageId, conversationId, emoji, userId }) => {
      const msg = store.messages.get(messageId);
      if (msg) {
        msg.reactions = msg.reactions || [];
        const group = msg.reactions.find(r => r.emoji === emoji);
        if (group) {
          if (group.users.includes(userId)) {
            group.users = group.users.filter(id => id !== userId);
            if (group.users.length === 0) msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
          } else {
            group.users.push(userId);
          }
        } else {
          msg.reactions.push({ emoji, users: [userId] });
        }
        io.to(`conv_${conversationId}`).emit('message:reaction-updated', {
          messageId,
          reactions: msg.reactions,
        });
      }
    });

    // ----------------------------------------------------
    // WEBRTC CALLING & SIGNALING
    // ----------------------------------------------------
    socket.on('call:invite', ({ targetUserId, callerId, callType, callId }) => {
      const targetSockets = userSockets.get(targetUserId);
      const callerUser = store.users.get(callerId);
      if (targetSockets && targetSockets.size > 0) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('call:incoming', {
            callId,
            caller: callerUser ? {
              _id: callerUser._id,
              username: callerUser.username,
              displayName: callerUser.displayName,
              avatar: callerUser.avatar,
            } : { _id: callerId },
            callType: callType || 'video',
          });
        });
      }
    });

    socket.on('call:accept', ({ targetUserId, callId, accepterId }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('call:accepted', { callId, accepterId });
        });
      }
    });

    socket.on('call:reject', ({ targetUserId, callId, reason }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('call:rejected', { callId, reason });
        });
      }
    });

    socket.on('call:end', ({ targetUserId, callId }) => {
      if (targetUserId) {
        const targetSockets = userSockets.get(targetUserId);
        if (targetSockets) {
          targetSockets.forEach(sId => io.to(sId).emit('call:ended', { callId }));
        }
      }
      socket.broadcast.emit('call:ended', { callId });
    });

    // WebRTC P2P Exchange
    socket.on('webrtc:offer', ({ offer, targetUserId, callId }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('webrtc:offer', { offer, callerSocketId: socket.id, callId });
        });
      }
    });

    socket.on('webrtc:answer', ({ answer, targetUserId, callId }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('webrtc:answer', { answer, callId });
        });
      }
    });

    socket.on('webrtc:ice-candidate', ({ candidate, targetUserId, callId }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(sId => {
          io.to(sId).emit('webrtc:ice-candidate', { candidate, callId });
        });
      }
    });

    // ----------------------------------------------------
    // MULTIPLAYER GAMING
    // ----------------------------------------------------
    socket.on('game:join', ({ roomId, userId }) => {
      socket.join(`game_${roomId}`);
      let room = store.gameRooms.get(roomId);
      if (room) {
        const isPlayer = room.players.some(p => p.user === userId);
        if (!isPlayer && room.players.length < 2) {
          const role = room.gameType === 'chess' ? 'black' : 'O';
          room.players.push({ user: userId, role, score: 0, ready: true });
        } else if (!isPlayer) {
          if (!room.spectators.includes(userId)) room.spectators.push(userId);
        }
        io.to(`game_${roomId}`).emit('game:updated', room);
      }
    });

    socket.on('game:move', ({ roomId, userId, moveData }) => {
      let room = store.gameRooms.get(roomId);
      if (!room) return;

      let moveResult = { success: false };

      if (room.gameType === 'chess') {
        moveResult = chessEngine.makeMove(roomId, moveData);
      } else if (room.gameType === 'tictactoe') {
        moveResult = ticTacToeEngine.makeMove(roomId, moveData);
      } else if (room.gameType === 'rps') {
        moveResult = rpsEngine.makeChoice(roomId, userId, moveData.choice);
      } else if (room.gameType === 'quiz') {
        moveResult = quizEngine.submitAnswer(roomId, userId, moveData.optionIndex);
      }

      if (moveResult.success) {
        room.gameState = moveResult.state;
        room.moves.push({ player: userId, move: moveData, timestamp: new Date() });
        io.to(`game_${roomId}`).emit('game:state', {
          gameState: room.gameState,
          lastMove: moveData,
          roomId,
        });
      } else {
        socket.emit('game:error', { message: moveResult.error || 'Invalid move' });
      }
    });

    socket.on('game:rematch', ({ roomId }) => {
      let room = store.gameRooms.get(roomId);
      if (room) {
        if (room.gameType === 'chess') room.gameState = chessEngine.resetGame(roomId);
        if (room.gameType === 'tictactoe') room.gameState = ticTacToeEngine.resetGame(roomId);
        if (room.gameType === 'rps') room.gameState = rpsEngine.resetGame(roomId);
        if (room.gameType === 'quiz') room.gameState = quizEngine.resetGame(roomId);
        room.status = 'playing';
        io.to(`game_${roomId}`).emit('game:updated', room);
      }
    });

    // ----------------------------------------------------
    // LIVE STREAMING & LIVE CHAT
    // ----------------------------------------------------
    socket.on('stream:join', ({ streamId }) => {
      socket.join(`stream_${streamId}`);
      const stream = store.streams.get(streamId);
      if (stream) {
        stream.viewerCount = (stream.viewerCount || 0) + 1;
        if (stream.viewerCount > stream.peakViewers) stream.peakViewers = stream.viewerCount;
        io.to(`stream_${streamId}`).emit('stream:viewers', { viewerCount: stream.viewerCount });
      }
    });

    socket.on('stream:leave', ({ streamId }) => {
      socket.leave(`stream_${streamId}`);
      const stream = store.streams.get(streamId);
      if (stream && stream.viewerCount > 1) {
        stream.viewerCount -= 1;
        io.to(`stream_${streamId}`).emit('stream:viewers', { viewerCount: stream.viewerCount });
      }
    });

    socket.on('stream:message', ({ streamId, userId, message }) => {
      const user = store.users.get(userId);
      const payload = {
        id: 'smsg_' + Date.now(),
        streamId,
        user: user ? {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
        } : { username: 'Anonymous' },
        message,
        timestamp: new Date(),
      };
      io.to(`stream_${streamId}`).emit('stream:chat-message', payload);
    });

    socket.on('stream:reaction', ({ streamId, emoji, username }) => {
      io.to(`stream_${streamId}`).emit('stream:floating-reaction', { emoji, username, id: Date.now() });
    });

    // ----------------------------------------------------
    // WATCH TOGETHER & LISTEN TOGETHER
    // ----------------------------------------------------
    socket.on('watch:join', ({ roomId, userId }) => {
      socket.join(`watch_${roomId}`);
      const room = store.watchRooms.get(roomId);
      if (room) {
        if (!room.participants.includes(userId)) room.participants.push(userId);
        io.to(`watch_${roomId}`).emit('watch:sync', room);
      }
    });

    socket.on('watch:action', ({ roomId, action, currentTime, mediaUrl }) => {
      const room = store.watchRooms.get(roomId);
      if (room) {
        if (action === 'play') room.playbackState.isPlaying = true;
        if (action === 'pause') room.playbackState.isPlaying = false;
        if (currentTime !== undefined) room.playbackState.currentTime = currentTime;
        if (mediaUrl) room.mediaUrl = mediaUrl;
        room.playbackState.lastUpdated = new Date();

        socket.to(`watch_${roomId}`).emit('watch:sync', room);
      }
    });

    socket.on('watch:message', ({ roomId, userId, message }) => {
      const user = store.users.get(userId);
      io.to(`watch_${roomId}`).emit('watch:chat-message', {
        id: 'wmsg_' + Date.now(),
        user: user ? { _id: user._id, displayName: user.displayName, avatar: user.avatar } : { displayName: 'Viewer' },
        message,
        timestamp: new Date(),
      });
    });

    // ----------------------------------------------------
    // DISCONNECT
    // ----------------------------------------------------
    socket.on('disconnect', () => {
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        onlineUsers.delete(socket.id);
        const userSet = userSockets.get(userId);
        if (userSet) {
          userSet.delete(socket.id);
          if (userSet.size === 0) {
            userSockets.delete(userId);
            const user = store.users.get(userId);
            if (user) {
              user.status = 'offline';
              user.lastSeen = new Date();
            }
            io.emit('presence:update', {
              userId,
              status: 'offline',
              lastSeen: new Date(),
            });
          }
        }
      }
    });
  });
};

module.exports = initSockets;
