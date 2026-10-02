const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// List Watch Rooms
const listWatchRooms = async (req, res) => {
  try {
    const rooms = Array.from(store.watchRooms.values()).map(r => ({
      ...r,
      hostDetail: sanitizeUser(store.users.get(r.host)),
      participantCount: (r.participants || []).length,
    }));
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Watch Room
const createWatchRoom = async (req, res) => {
  try {
    const hostId = req.user._id || req.user.id;
    const { title, mediaUrl, mediaType = 'youtube' } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Room title is required' });

    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newRoom = {
      _id: roomId,
      roomId,
      title: title.trim(),
      host: hostId,
      mediaType,
      mediaUrl: mediaUrl || 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      playbackState: { isPlaying: false, currentTime: 0, lastUpdated: new Date() },
      participants: [hostId],
      queue: [],
      createdAt: new Date(),
    };

    store.watchRooms.set(roomId, newRoom);

    res.status(201).json({
      success: true,
      data: {
        ...newRoom,
        hostDetail: sanitizeUser(store.users.get(hostId)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Watch Room by ID
const getWatchRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = store.watchRooms.get(roomId);

    if (!room) return res.status(404).json({ success: false, message: 'Watch room not found' });

    res.status(200).json({
      success: true,
      data: {
        ...room,
        hostDetail: sanitizeUser(store.users.get(room.host)),
        participantDetails: (room.participants || []).map(id => sanitizeUser(store.users.get(id))).filter(Boolean),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listWatchRooms,
  createWatchRoom,
  getWatchRoom,
};
