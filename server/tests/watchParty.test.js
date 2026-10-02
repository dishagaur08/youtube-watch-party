const request = require('supertest');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');
const express = require('express');
const registerWatchPartySockets = require('../src/services/watchParty/watchPartySockets');
const roomManager = require('../src/services/watchParty/WatchRoomManager');

describe('Watch Party Domain & RBAC WebSocket Tests', () => {
  let io, server, serverSocket, clientSocket1, clientSocket2, port;

  beforeAll((done) => {
    const app = express();
    server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
      registerWatchPartySockets(io, socket);
    });

    server.listen(() => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close(done);
  });

  afterEach(() => {
    if (clientSocket1 && clientSocket1.connected) clientSocket1.disconnect();
    if (clientSocket2 && clientSocket2.connected) clientSocket2.disconnect();
  });

  test('Host joins first, receives Host role and initial sync_state', (done) => {
    clientSocket1 = Client(`http://localhost:${port}`);
    
    clientSocket1.on('connect', () => {
      clientSocket1.emit('join_room', {
        roomId: 'TEST_ROOM_1',
        username: 'AliceHost',
        userId: 'user_alice',
      });
    });

    clientSocket1.on('sync_state', (state) => {
      expect(state.roomId).toBe('TEST_ROOM_1');
      expect(state.role).toBe('Host');
      expect(state.participants.length).toBe(1);
      expect(state.participants[0].username).toBe('AliceHost');
      done();
    });
  });

  test('Second joiner receives Participant role by default, Host receives user_joined', (done) => {
    clientSocket1 = Client(`http://localhost:${port}`);
    clientSocket2 = Client(`http://localhost:${port}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join_room', {
        roomId: 'TEST_ROOM_2',
        username: 'AliceHost',
        userId: 'user_alice',
      });
    });

    clientSocket1.once('sync_state', () => {
      // Alice is in, now Bob joins
      clientSocket2.emit('join_room', {
        roomId: 'TEST_ROOM_2',
        username: 'BobParticipant',
        userId: 'user_bob',
      });
    });

    clientSocket2.once('sync_state', (state) => {
      expect(state.role).toBe('Participant');
      expect(state.participants.length).toBe(2);
    });

    clientSocket1.once('user_joined', (data) => {
      expect(data.username).toBe('BobParticipant');
      expect(data.role).toBe('Participant');
      done();
    });
  });

  test('RBAC: Participant cannot control playback or change video', (done) => {
    clientSocket1 = Client(`http://localhost:${port}`);
    clientSocket2 = Client(`http://localhost:${port}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join_room', {
        roomId: 'TEST_ROOM_3',
        username: 'AliceHost',
        userId: 'user_alice',
      });
    });

    clientSocket1.once('sync_state', () => {
      clientSocket2.emit('join_room', {
        roomId: 'TEST_ROOM_3',
        username: 'BobParticipant',
        userId: 'user_bob',
      });
    });

    clientSocket2.once('sync_state', () => {
      // Participant tries to play
      clientSocket2.emit('play');
    });

    clientSocket2.once('error', (err) => {
      expect(err.message).toMatch(/Unauthorized/);
      done();
    });
  });

  test('Host can promote Participant to Moderator, and Moderator can now control playback', (done) => {
    clientSocket1 = Client(`http://localhost:${port}`);
    clientSocket2 = Client(`http://localhost:${port}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join_room', {
        roomId: 'TEST_ROOM_4',
        username: 'AliceHost',
        userId: 'user_alice',
      });
    });

    clientSocket1.once('sync_state', () => {
      clientSocket2.emit('join_room', {
        roomId: 'TEST_ROOM_4',
        username: 'BobParticipant',
        userId: 'user_bob',
      });
    });

    clientSocket1.once('user_joined', () => {
      // Alice promotes Bob to Moderator
      clientSocket1.emit('assign_role', {
        userId: 'user_bob',
        role: 'Moderator',
      });
    });

    clientSocket2.on('role_assigned', (data) => {
      if (data.userId === 'user_bob' && data.role === 'Moderator') {
        // Now Bob (Moderator) can play
        clientSocket2.emit('play');
      }
    });

    clientSocket1.on('sync_state', (state) => {
      if (state.playState === 'PLAYING') {
        expect(state.playState).toBe('PLAYING');
        done();
      }
    });
  });
});
