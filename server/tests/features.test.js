const request = require('supertest');
const app = require('../src/app');

describe('VYNTRA Chat & AI Integration Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vyntra.io', password: 'vyntra123' });
    authToken = loginRes.body.data?.token;
  });

  it('GET /api/chat/conversations should return user conversations', async () => {
    const res = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/ai/chat should return an intelligent assistant response', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        messages: [{ role: 'user', content: 'What is VYNTRA?' }],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toBeDefined();
  });

  it('POST /api/ai/smart-replies should generate suggestions', async () => {
    const res = await request(app)
      .post('/api/ai/smart-replies')
      .send({
        messages: ['Can you send the project report?'],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/games/rooms should create a game room session', async () => {
    const res = await request(app)
      .post('/api/games/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameType: 'tictactoe' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roomId).toBeDefined();
  });

  it('GET /api/admin/metrics should return metrics for admin user', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThan(0);
  });
});
