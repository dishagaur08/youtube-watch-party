const Participant = require('./Participant');

/**
 * WatchRoom Domain Model
 * Encapsulates playback state, participants, role enforcement, and room lifecycle.
 */
class WatchRoom {
  constructor({ roomId, title = 'YouTube Watch Party', hostUser, videoId = 'dQw4w9WgXcQ' }) {
    this.roomId = roomId;
    this.title = title;
    this.videoId = videoId;
    this.playState = 'PAUSED'; // 'PLAYING' | 'PAUSED' | 'BUFFERING'
    this.currentTime = 0;
    this.lastUpdated = Date.now();
    this.participants = new Map(); // socketId -> Participant
    this.createdAt = new Date();

    if (hostUser) {
      const hostParticipant = new Participant({
        socketId: hostUser.socketId,
        userId: hostUser.userId,
        username: hostUser.username,
        role: 'Host',
        avatar: hostUser.avatar,
      });
      this.participants.set(hostUser.socketId, hostParticipant);
    }
  }

  getEffectiveCurrentTime() {
    if (this.playState === 'PLAYING') {
      const elapsedSeconds = (Date.now() - this.lastUpdated) / 1000;
      return this.currentTime + elapsedSeconds;
    }
    return this.currentTime;
  }

  addParticipant({ socketId, userId, username, avatar }) {
    // If the room has no host, first user becomes host
    const isFirstUser = this.participants.size === 0;
    const role = isFirstUser ? 'Host' : 'Participant';

    const participant = new Participant({
      socketId,
      userId,
      username,
      role,
      avatar,
    });

    this.participants.set(socketId, participant);
    return participant;
  }

  removeParticipant(socketId) {
    const participant = this.participants.get(socketId);
    if (!participant) return null;

    this.participants.delete(socketId);

    // If host leaves and other users exist, auto-promote next Moderator or first user to Host
    if (participant.role === 'Host' && this.participants.size > 0) {
      const participantsList = Array.from(this.participants.values());
      const nextMod = participantsList.find(p => p.role === 'Moderator');
      if (nextMod) {
        nextMod.setRole('Host');
      } else if (participantsList.length > 0) {
        participantsList[0].setRole('Host');
      }
    }

    return participant;
  }

  getParticipantBySocketId(socketId) {
    return this.participants.get(socketId);
  }

  getParticipantByUserId(userId) {
    for (const p of this.participants.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  getHost() {
    for (const p of this.participants.values()) {
      if (p.role === 'Host') return p;
    }
    return null;
  }

  setPlay(socketId) {
    const participant = this.getParticipantBySocketId(socketId);
    if (!participant || !participant.canControlPlayback()) {
      return { success: false, error: 'Unauthorized: Only Host or Moderator can control playback' };
    }
    this.currentTime = this.getEffectiveCurrentTime();
    this.playState = 'PLAYING';
    this.lastUpdated = Date.now();
    return { success: true, state: this.getState() };
  }

  setPause(socketId, currentTime) {
    const participant = this.getParticipantBySocketId(socketId);
    if (!participant || !participant.canControlPlayback()) {
      return { success: false, error: 'Unauthorized: Only Host or Moderator can control playback' };
    }
    this.currentTime = typeof currentTime === 'number' ? currentTime : this.getEffectiveCurrentTime();
    this.playState = 'PAUSED';
    this.lastUpdated = Date.now();
    return { success: true, state: this.getState() };
  }

  setSeek(socketId, time) {
    const participant = this.getParticipantBySocketId(socketId);
    if (!participant || !participant.canControlPlayback()) {
      return { success: false, error: 'Unauthorized: Only Host or Moderator can seek video' };
    }
    this.currentTime = Math.max(0, Number(time) || 0);
    this.lastUpdated = Date.now();
    return { success: true, state: this.getState() };
  }

  setVideo(socketId, videoId) {
    const participant = this.getParticipantBySocketId(socketId);
    if (!participant || !participant.canControlPlayback()) {
      return { success: false, error: 'Unauthorized: Only Host or Moderator can change video' };
    }
    this.videoId = videoId;
    this.currentTime = 0;
    this.playState = 'PAUSED';
    this.lastUpdated = Date.now();
    return { success: true, state: this.getState() };
  }

  assignRole(requesterSocketId, targetUserId, newRole) {
    const requester = this.getParticipantBySocketId(requesterSocketId);
    if (!requester || !requester.canManageParticipants()) {
      return { success: false, error: 'Unauthorized: Only Host can assign roles' };
    }

    const target = this.getParticipantByUserId(targetUserId);
    if (!target) {
      return { success: false, error: 'Participant not found in room' };
    }

    if (newRole === 'Host') {
      // Transfer Host
      requester.setRole('Moderator');
      target.setRole('Host');
    } else {
      target.setRole(newRole);
    }

    return {
      success: true,
      target: target.toJSON(),
      participants: this.getParticipantsList(),
    };
  }

  removeUserByHost(requesterSocketId, targetUserId) {
    const requester = this.getParticipantBySocketId(requesterSocketId);
    if (!requester || !requester.canManageParticipants()) {
      return { success: false, error: 'Unauthorized: Only Host can remove participants' };
    }

    const target = this.getParticipantByUserId(targetUserId);
    if (!target) {
      return { success: false, error: 'Participant not found in room' };
    }

    if (target.role === 'Host') {
      return { success: false, error: 'Cannot remove the room host' };
    }

    this.participants.delete(target.socketId);
    return {
      success: true,
      removedUser: target.toJSON(),
      participants: this.getParticipantsList(),
    };
  }

  getState() {
    return {
      roomId: this.roomId,
      title: this.title,
      videoId: this.videoId,
      playState: this.playState,
      currentTime: this.getEffectiveCurrentTime(),
      lastUpdated: this.lastUpdated,
    };
  }

  getParticipantsList() {
    return Array.from(this.participants.values()).map(p => p.toJSON());
  }

  toJSON() {
    return {
      roomId: this.roomId,
      title: this.title,
      videoId: this.videoId,
      playState: this.playState,
      currentTime: this.getEffectiveCurrentTime(),
      participants: this.getParticipantsList(),
      createdAt: this.createdAt,
    };
  }
}

module.exports = WatchRoom;
