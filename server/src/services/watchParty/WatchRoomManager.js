const WatchRoom = require('./WatchRoom');

/**
 * WatchRoomManager
 * Singleton managing all active WatchParty room instances.
 */
class WatchRoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> WatchRoom
    this.socketToRoom = new Map(); // socketId -> roomId
  }

  createRoom({ roomId, title, hostUser, videoId }) {
    const id = roomId || `room_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const room = new WatchRoom({
      roomId: id,
      title: title || 'YouTube Watch Party',
      hostUser,
      videoId: videoId || 'dQw4w9WgXcQ',
    });
    this.rooms.set(id, room);
    if (hostUser?.socketId) {
      this.socketToRoom.set(hostUser.socketId, id);
    }
    return room;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.trim()) || this.rooms.get(roomId.trim().toUpperCase());
  }

  getOrCreateRoom(roomId, title, videoId) {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom({ roomId, title, videoId });
    }
    return room;
  }

  getRoomBySocketId(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, { socketId, userId, username, avatar }) {
    const room = this.getOrCreateRoom(roomId);
    const participant = room.addParticipant({ socketId, userId, username, avatar });
    this.socketToRoom.set(socketId, room.roomId);
    return { room, participant };
  }

  leaveRoom(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    this.socketToRoom.delete(socketId);

    if (room) {
      const removedParticipant = room.removeParticipant(socketId);
      // Clean up empty rooms after some time or keep them available
      if (room.participants.size === 0) {
        // keep room in memory for a while or remove
      }
      return { room, participant: removedParticipant };
    }
    return null;
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(r => r.toJSON());
  }
}

// Export singleton instance
module.exports = new WatchRoomManager();
