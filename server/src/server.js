const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const initSockets = require('./sockets/socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSockets(io);

const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`
  ======================================================
  ✨  VYNTRA PRODUCTION SERVER READY
  ------------------------------------------------------
  🌐  HTTP API Server:   http://localhost:${env.PORT}
  ⚡  Socket.IO Server:  ws://localhost:${env.PORT}
  🩺  Health Check:      http://localhost:${env.PORT}/api/health
  🔒  Environment:       ${env.NODE_ENV}
  ======================================================
    `);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server, io };
