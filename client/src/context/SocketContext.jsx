import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineStatusMap, setOnlineStatusMap] = useState({});

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (user) {
      s.emit('user:online', { userId: user._id || user.id });
    }

    const handlePresence = ({ userId, status, customStatus }) => {
      setOnlineStatusMap(prev => ({
        ...prev,
        [userId]: { status, customStatus, lastSeen: new Date() }
      }));
    };

    s.on('presence:update', handlePresence);

    return () => {
      s.off('presence:update', handlePresence);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineStatusMap }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
export default SocketContext;
