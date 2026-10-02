const roomManager = require('./WatchRoomManager');

/**
 * Register all YouTube Watch Party Socket.IO events exactly matching the assignment specification.
 */
function registerWatchPartySockets(io, socket) {
  // ----------------------------------------------------
  // 1. JOIN ROOM
  // Payload: { roomId, username, userId, avatar }
  // Response: sync_state to client, user_joined to room
  // ----------------------------------------------------
  socket.on('join_room', ({ roomId, username, userId, avatar }) => {
    if (!roomId) {
      return socket.emit('error', { message: 'roomId is required to join' });
    }

    const { room, participant } = roomManager.joinRoom(roomId, {
      socketId: socket.id,
      userId: userId || socket.userId,
      username: username || 'Guest',
      avatar,
    });

    socket.join(`room_${room.roomId}`);

    // Send full current sync state to the new client
    socket.emit('sync_state', {
      ...room.getState(),
      role: participant.role,
      participants: room.getParticipantsList(),
    });

    // Broadcast user_joined to all other clients in the room
    socket.to(`room_${room.roomId}`).emit('user_joined', {
      username: participant.username,
      userId: participant.userId,
      role: participant.role,
      participants: room.getParticipantsList(),
    });
  });

  // ----------------------------------------------------
  // 2. LEAVE ROOM
  // Payload: { roomId }
  // Response: user_left broadcast
  // ----------------------------------------------------
  socket.on('leave_room', ({ roomId }) => {
    const result = roomManager.leaveRoom(socket.id);
    if (result && result.participant) {
      const { room, participant } = result;
      socket.leave(`room_${room.roomId}`);
      io.to(`room_${room.roomId}`).emit('user_left', {
        username: participant.username,
        userId: participant.userId,
        participants: room.getParticipantsList(),
      });
    }
  });

  // ----------------------------------------------------
  // 3. PLAY
  // Payload: {}
  // RBAC: Requires Host or Moderator
  // Response: sync_state broadcast
  // ----------------------------------------------------
  socket.on('play', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const result = room.setPlay(socket.id);
    if (result.success) {
      io.to(`room_${room.roomId}`).emit('sync_state', {
        ...result.state,
        triggeredBy: socket.id,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 4. PAUSE
  // Payload: { currentTime? }
  // RBAC: Requires Host or Moderator
  // Response: sync_state broadcast
  // ----------------------------------------------------
  socket.on('pause', (payload) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const currentTime = payload?.currentTime;
    const result = room.setPause(socket.id, currentTime);
    if (result.success) {
      io.to(`room_${room.roomId}`).emit('sync_state', {
        ...result.state,
        triggeredBy: socket.id,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 5. SEEK
  // Payload: { time }
  // RBAC: Requires Host or Moderator
  // Response: sync_state broadcast
  // ----------------------------------------------------
  socket.on('seek', ({ time }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const result = room.setSeek(socket.id, time);
    if (result.success) {
      io.to(`room_${room.roomId}`).emit('sync_state', {
        ...result.state,
        triggeredBy: socket.id,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 6. CHANGE VIDEO
  // Payload: { videoId }
  // RBAC: Requires Host or Moderator
  // Response: sync_state broadcast
  // ----------------------------------------------------
  socket.on('change_video', ({ videoId }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const result = room.setVideo(socket.id, videoId);
    if (result.success) {
      io.to(`room_${room.roomId}`).emit('sync_state', {
        ...result.state,
        triggeredBy: socket.id,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 7. ASSIGN ROLE
  // Payload: { userId, role }
  // RBAC: Requires Host only
  // Response: role_assigned broadcast
  // ----------------------------------------------------
  socket.on('assign_role', ({ userId, role }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const result = room.assignRole(socket.id, userId, role);
    if (result.success) {
      io.to(`room_${room.roomId}`).emit('role_assigned', {
        userId: result.target.userId,
        username: result.target.username,
        role: result.target.role,
        participants: result.participants,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 8. REMOVE PARTICIPANT
  // Payload: { userId }
  // RBAC: Requires Host only
  // Response: participant_removed broadcast & target socket leave
  // ----------------------------------------------------
  socket.on('remove_participant', ({ userId }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const targetUser = room.getParticipantByUserId(userId);
    const targetSocketId = targetUser?.socketId;

    const result = room.removeUserByHost(socket.id, userId);
    if (result.success) {
      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(`room_${room.roomId}`);
          targetSocket.emit('kicked_from_room', { message: 'You have been removed from the room by the host.' });
        }
      }

      io.to(`room_${room.roomId}`).emit('participant_removed', {
        userId,
        participants: result.participants,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ----------------------------------------------------
  // 9. ROOM CHAT & REACTIONS (Bonus)
  // Payload: { message } / { emoji }
  // ----------------------------------------------------
  socket.on('room_chat_message', ({ message }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const participant = room.getParticipantBySocketId(socket.id);
    if (!participant) return;

    io.to(`room_${room.roomId}`).emit('room_chat_message', {
      id: 'rcmsg_' + Date.now(),
      userId: participant.userId,
      username: participant.username,
      role: participant.role,
      avatar: participant.avatar,
      message,
      timestamp: new Date(),
    });
  });

  socket.on('room_reaction', ({ emoji }) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const participant = room.getParticipantBySocketId(socket.id);
    io.to(`room_${room.roomId}`).emit('room_reaction', {
      id: 'react_' + Date.now() + Math.random(),
      emoji,
      username: participant?.username || 'Viewer',
    });
  });

  // ----------------------------------------------------
  // 10. DISCONNECT CLEANUP
  // ----------------------------------------------------
  socket.on('disconnect', () => {
    const result = roomManager.leaveRoom(socket.id);
    if (result && result.participant) {
      const { room, participant } = result;
      io.to(`room_${room.roomId}`).emit('user_left', {
        username: participant.username,
        userId: participant.userId,
        participants: room.getParticipantsList(),
      });
    }
  });
}

module.exports = registerWatchPartySockets;
