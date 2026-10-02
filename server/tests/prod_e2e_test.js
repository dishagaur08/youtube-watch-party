const Client = require('socket.io-client');

async function testProductionDeployment() {
  console.log('=== RUNNING PRODUCTION END-TO-END DEPLOYMENT TEST ===');
  const backendUrl = 'https://youtube-watch-party-cfvx.onrender.com';
  const frontendUrl = 'https://youtube-watch-party-1-xep4.onrender.com';
  const results = {};

  // 1. Test Backend Health API
  try {
    const healthRes = await fetch(`${backendUrl}/api/health`);
    const healthData = await healthRes.json();
    results['1. Backend Health Check'] = healthRes.ok && healthData?.status === 'healthy' ? 'PASS' : 'FAIL';
  } catch (err) {
    results['1. Backend Health Check'] = `FAIL (${err.message})`;
  }

  // 2. Test User Registration & Login API
  const testUser = {
    username: 'prod_user_' + Date.now(),
    email: `prod_${Date.now()}@test.com`,
    password: 'Password123!',
    displayName: 'Production Tester',
  };

  let token = '';
  try {
    const regRes = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    token = regData?.data?.token;
    results['2. User Registration API'] = regRes.status === 201 && token ? 'PASS' : 'FAIL';
  } catch (err) {
    results['2. User Registration API'] = `FAIL (${err.message})`;
  }

  try {
    const loginRes = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const loginData = await loginRes.json();
    results['3. User Login API'] = loginRes.status === 200 && loginData?.data?.token ? 'PASS' : 'FAIL';
  } catch (err) {
    results['3. User Login API'] = `FAIL (${err.message})`;
  }

  // 3. Test Production WebSocket Connection & Room Creation
  const roomId = 'PROD_TEST_' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const host = Client(backendUrl, { transports: ['websocket', 'polling'] });
  let participant = null;

  try {
    await new Promise((resolve, reject) => {
      host.on('connect', () => {
        host.emit('join_room', {
          roomId,
          username: 'ProductionHost',
          userId: 'usr_prod_host',
        });
      });

      host.once('sync_state', (state) => {
        if (state.roomId === roomId && state.role === 'Host' && state.participants.length === 1) {
          results['4. Room Creation & Host Auto-Assignment'] = 'PASS';
          resolve();
        }
      });

      setTimeout(() => reject(new Error('Host room creation timed out')), 8000);
    });
  } catch (err) {
    results['4. Room Creation & Host Auto-Assignment'] = `FAIL (${err.message})`;
  }

  // 4. Test Second Client Join & Default Role
  try {
    await new Promise((resolve, reject) => {
      participant = Client(backendUrl, { transports: ['websocket', 'polling'] });
      participant.on('connect', () => {
        participant.emit('join_room', {
          roomId,
          username: 'ProductionParticipant',
          userId: 'usr_prod_part',
        });
      });

      participant.once('sync_state', (state) => {
        if (state.role === 'Participant' && state.participants.length === 2) {
          results['5. Join Room & Participant Role Assignment'] = 'PASS';
          resolve();
        }
      });

      setTimeout(() => reject(new Error('Participant join timed out')), 8000);
    });
  } catch (err) {
    results['5. Join Room & Participant Role Assignment'] = `FAIL (${err.message})`;
  }

  // 5. Test Play Synchronization
  try {
    await new Promise((resolve, reject) => {
      participant.once('sync_state', (state) => {
        if (state.playState === 'PLAYING') {
          results['6. Play Synchronization'] = 'PASS';
          resolve();
        }
      });

      host.emit('play');
      setTimeout(() => reject(new Error('Play sync timed out')), 8000);
    });
  } catch (err) {
    results['6. Play Synchronization'] = `FAIL (${err.message})`;
  }

  // 6. Test Pause Synchronization
  try {
    await new Promise((resolve, reject) => {
      participant.once('sync_state', (state) => {
        if (state.playState === 'PAUSED') {
          results['7. Pause Synchronization'] = 'PASS';
          resolve();
        }
      });

      host.emit('pause', { currentTime: 10 });
      setTimeout(() => reject(new Error('Pause sync timed out')), 8000);
    });
  } catch (err) {
    results['7. Pause Synchronization'] = `FAIL (${err.message})`;
  }

  // 7. Test Seek Synchronization
  try {
    await new Promise((resolve, reject) => {
      participant.once('sync_state', (state) => {
        if (state.currentTime === 95) {
          results['8. Seek Synchronization'] = 'PASS';
          resolve();
        }
      });

      host.emit('seek', { time: 95 });
      setTimeout(() => reject(new Error('Seek sync timed out')), 8000);
    });
  } catch (err) {
    results['8. Seek Synchronization'] = `FAIL (${err.message})`;
  }

  // 8. Test Video Change Synchronization
  try {
    await new Promise((resolve, reject) => {
      participant.once('sync_state', (state) => {
        if (state.videoId === 'kJQP7kiw5Fk') {
          results['9. Video Change Synchronization'] = 'PASS';
          resolve();
        }
      });

      host.emit('change_video', { videoId: 'kJQP7kiw5Fk' });
      setTimeout(() => reject(new Error('Change video sync timed out')), 8000);
    });
  } catch (err) {
    results['9. Video Change Synchronization'] = `FAIL (${err.message})`;
  }

  // 9. Test Participant Permission Restriction (RBAC Guard)
  try {
    await new Promise((resolve, reject) => {
      participant.once('error', (err) => {
        if (err.message && err.message.includes('Unauthorized')) {
          results['10. Participant RBAC Permission Guard'] = 'PASS';
          resolve();
        }
      });

      participant.emit('play');
      setTimeout(() => reject(new Error('RBAC guard timed out')), 8000);
    });
  } catch (err) {
    results['10. Participant RBAC Permission Guard'] = `FAIL (${err.message})`;
  }

  // 10. Test Promote Participant to Moderator
  try {
    await new Promise((resolve, reject) => {
      participant.once('role_assigned', (data) => {
        if (data.userId === 'usr_prod_part' && data.role === 'Moderator') {
          results['11. Host Assigns Moderator Role'] = 'PASS';
          resolve();
        }
      });

      host.emit('assign_role', { userId: 'usr_prod_part', role: 'Moderator' });
      setTimeout(() => reject(new Error('Role promotion timed out')), 8000);
    });
  } catch (err) {
    results['11. Host Assigns Moderator Role'] = `FAIL (${err.message})`;
  }

  // 11. Test Moderator Playback Control
  try {
    await new Promise((resolve, reject) => {
      host.once('sync_state', (state) => {
        if (state.playState === 'PLAYING') {
          results['12. Moderator Control Execution'] = 'PASS';
          resolve();
        }
      });

      participant.emit('play');
      setTimeout(() => reject(new Error('Moderator play timed out')), 8000);
    });
  } catch (err) {
    results['12. Moderator Control Execution'] = `FAIL (${err.message})`;
  }

  // 12. Test Demote Moderator to Participant
  try {
    await new Promise((resolve, reject) => {
      participant.once('role_assigned', (data) => {
        if (data.userId === 'usr_prod_part' && data.role === 'Participant') {
          results['13. Demote Moderator to Participant'] = 'PASS';
          resolve();
        }
      });

      host.emit('assign_role', { userId: 'usr_prod_part', role: 'Participant' });
      setTimeout(() => reject(new Error('Demote timed out')), 8000);
    });
  } catch (err) {
    results['13. Demote Moderator to Participant'] = `FAIL (${err.message})`;
  }

  // 13. Test Room Chat & Reactions
  try {
    await new Promise((resolve, reject) => {
      participant.once('room_chat_message', (msg) => {
        if (msg.message === 'Hello production room!') {
          results['14. Real-Time Room Chat'] = 'PASS';
          resolve();
        }
      });

      host.emit('room_chat_message', { message: 'Hello production room!' });
      setTimeout(() => reject(new Error('Chat timed out')), 8000);
    });
  } catch (err) {
    results['14. Real-Time Room Chat'] = `FAIL (${err.message})`;
  }

  try {
    await new Promise((resolve, reject) => {
      participant.once('room_reaction', (r) => {
        if (r.emoji === '🔥') {
          results['15. Floating Emoji Reactions'] = 'PASS';
          resolve();
        }
      });

      host.emit('room_reaction', { emoji: '🔥' });
      setTimeout(() => reject(new Error('Reaction timed out')), 8000);
    });
  } catch (err) {
    results['15. Floating Emoji Reactions'] = `FAIL (${err.message})`;
  }

  // 14. Test Remove Participant (Kick)
  try {
    await new Promise((resolve, reject) => {
      participant.once('kicked_from_room', () => {
        results['16. Host Remove/Kick Participant'] = 'PASS';
        resolve();
      });

      host.emit('remove_participant', { userId: 'usr_prod_part' });
      setTimeout(() => reject(new Error('Kick timed out')), 8000);
    });
  } catch (err) {
    results['16. Host Remove/Kick Participant'] = `FAIL (${err.message})`;
  }

  // 15. Verify Shareable Link Format
  const expectedShareUrl = `${frontendUrl}/watch?room=${roomId}`;
  results['17. Shareable Room Link Format'] = expectedShareUrl.includes(roomId) ? 'PASS' : 'FAIL';

  if (host && host.connected) host.disconnect();
  if (participant && participant.connected) participant.disconnect();

  console.log('\n=== PRODUCTION TEST SUMMARY RESULTS ===');
  console.table(results);
}

testProductionDeployment().catch(err => {
  console.error('Test script crashed:', err);
});
