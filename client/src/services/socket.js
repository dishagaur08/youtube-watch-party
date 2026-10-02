import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[VYNTRA Live Socket] Connected to real-time grid:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[VYNTRA Socket] Connection note:', err.message);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) return initSocket();
  return socket;
};

export default getSocket;
