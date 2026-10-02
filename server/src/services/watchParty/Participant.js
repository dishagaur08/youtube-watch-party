/**
 * Participant Domain Model
 * Represents a user connected to a Watch Party Room.
 */
class Participant {
  constructor({ socketId, userId, username, role = 'Participant', avatar = null }) {
    this.socketId = socketId;
    this.userId = userId || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.username = username || 'Guest';
    this.role = role; // 'Host' | 'Moderator' | 'Participant'
    this.avatar = avatar;
    this.joinedAt = new Date();
  }

  canControlPlayback() {
    return this.role === 'Host' || this.role === 'Moderator';
  }

  canManageParticipants() {
    return this.role === 'Host';
  }

  setRole(newRole) {
    if (['Host', 'Moderator', 'Participant'].includes(newRole)) {
      this.role = newRole;
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      socketId: this.socketId,
      userId: this.userId,
      username: this.username,
      role: this.role,
      avatar: this.avatar,
      joinedAt: this.joinedAt,
    };
  }
}

module.exports = Participant;
