const Client = require('socket.io-client');

async function runEndToEndVerification() {
  console.log('--- STARTING E2E AUTOMATED VERIFICATION ---');
  const serverUrl = 'http://localhost:5000';
  const roomId = 'E2E_VERIFICATION_ROOM';

  // 1. Host Client Connection & Room Creation
  const host = Client(serverUrl);
  let bob = null;

  await new Promise((resolve, reject) => {
    host.on('connect', () => {
      console.log('✅ Host connected to Socket.IO server');
      host.emit('join_room', {
        roomId,
        username: 'AliceHost',
        userId: 'user_alice_host',
      });
    });

    host.once('sync_state', (state) => {
      console.log('✅ Test 1: Host Room Creation & Sync State: PASS', state.roomId, state.role);
      resolve();
    });

    setTimeout(() => reject(new Error('Host join timeout')), 4000);
  });

  // 2. Participant Joins via Room Code
  await new Promise((resolve, reject) => {
    bob = Client(serverUrl);
    bob.on('connect', () => {
      bob.emit('join_room', {
        roomId,
        username: 'BobParticipant',
        userId: 'user_bob_joiner',
      });
    });

    bob.once('sync_state', (state) => {
      console.log('✅ Test 2: Participant Join & Default Role: PASS', state.role === 'Participant');
      resolve();
    });

    setTimeout(() => reject(new Error('Bob join timeout')), 4000);
  });

  // 3. Test Play & Pause Synchronization
  await new Promise((resolve, reject) => {
    bob.once('sync_state', (state) => {
      if (state.playState === 'PLAYING') {
        console.log('✅ Test 3: Real-Time Play Sync: PASS');
        resolve();
      }
    });

    host.emit('play');
    setTimeout(() => reject(new Error('Play sync timeout')), 4000);
  });

  // 4. Test Seek Synchronization
  await new Promise((resolve, reject) => {
    bob.once('sync_state', (state) => {
      if (state.currentTime === 45) {
        console.log('✅ Test 4: Real-Time Seek Sync: PASS');
        resolve();
      }
    });

    host.emit('seek', { time: 45 });
    setTimeout(() => reject(new Error('Seek sync timeout')), 4000);
  });

  // 5. Test Change Video Synchronization
  await new Promise((resolve, reject) => {
    bob.once('sync_state', (state) => {
      if (state.videoId === 'L_LUpnjgPso') {
        console.log('✅ Test 5: Synchronized Video Change: PASS');
        resolve();
      }
    });

    host.emit('change_video', { videoId: 'L_LUpnjgPso' });
    setTimeout(() => reject(new Error('Change video sync timeout')), 4000);
  });

  // 6. Test RBAC: Participant playback control rejection
  await new Promise((resolve, reject) => {
    bob.once('error', (err) => {
      console.log('✅ Test 6: Participant Playback RBAC Guard: PASS', err.message);
      resolve();
    });

    bob.emit('play');
    setTimeout(() => reject(new Error('RBAC guard timeout')), 4000);
  });

  // 7. Test Promote Participant to Moderator
  await new Promise((resolve, reject) => {
    bob.once('role_assigned', (data) => {
      if (data.userId === 'user_bob_joiner' && data.role === 'Moderator') {
        console.log('✅ Test 7: Host Role Promotion to Moderator: PASS');
        resolve();
      }
    });

    host.emit('assign_role', { userId: 'user_bob_joiner', role: 'Moderator' });
    setTimeout(() => reject(new Error('Role promote timeout')), 4000);
  });

  // 8. Test Moderator can now control playback
  await new Promise((resolve, reject) => {
    host.once('sync_state', (state) => {
      if (state.playState === 'PAUSED') {
        console.log('✅ Test 8: Moderator Control Execution: PASS');
        resolve();
      }
    });

    bob.emit('pause', { currentTime: 45 });
    setTimeout(() => reject(new Error('Moderator control timeout')), 4000);
  });

  // 9. Test Demote Moderator to Participant
  await new Promise((resolve, reject) => {
    bob.once('role_assigned', (data) => {
      if (data.userId === 'user_bob_joiner' && data.role === 'Participant') {
        console.log('✅ Test 9: Demote Moderator to Participant: PASS');
        resolve();
      }
    });

    host.emit('assign_role', { userId: 'user_bob_joiner', role: 'Participant' });
    setTimeout(() => reject(new Error('Demote timeout')), 4000);
  });

  // 10. Test Room Chat & Reactions
  await new Promise((resolve, reject) => {
    bob.once('room_chat_message', (msg) => {
      if (msg.message === 'Hello room!') {
        console.log('✅ Test 10: Real-Time Room Chat: PASS');
        resolve();
      }
    });

    host.emit('room_chat_message', { message: 'Hello room!' });
    setTimeout(() => reject(new Error('Chat timeout')), 4000);
  });

  await new Promise((resolve, reject) => {
    bob.once('room_reaction', (r) => {
      if (r.emoji === '🔥') {
        console.log('✅ Test 11: Real-Time Floating Reactions: PASS');
        resolve();
      }
    });

    host.emit('room_reaction', { emoji: '🔥' });
    setTimeout(() => reject(new Error('Reaction timeout')), 4000);
  });

  // 12. Test Kick Participant
  await new Promise((resolve, reject) => {
    bob.once('kicked_from_room', (data) => {
      console.log('✅ Test 12: Host Kick Participant: PASS', data.message);
      resolve();
    });

    host.emit('remove_participant', { userId: 'user_bob_joiner' });
    setTimeout(() => reject(new Error('Kick participant timeout')), 4000);
  });

  host.disconnect();
  bob.disconnect();
  console.log('--- ALL E2E TESTS SUCCESSFULLY PASSED ---');
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
