const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// List active streams
const listStreams = async (req, res) => {
  try {
    const { category } = req.query;
    let streams = Array.from(store.streams.values()).filter(s => s.isLive);

    if (category && category !== 'All') {
      streams = streams.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    const payload = streams.map(s => ({
      ...s,
      streamerDetail: sanitizeUser(store.users.get(s.streamer)),
    }));

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stream by ID
const getStreamById = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = store.streams.get(streamId);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...stream,
        streamerDetail: sanitizeUser(store.users.get(stream.streamer)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create / Start Live Stream
const createStream = async (req, res) => {
  try {
    const streamerId = req.user._id || req.user.id;
    const { title, description, category = 'Gaming', thumbnail, tags = [] } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Stream title is required' });
    }

    const streamId = 'stream_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newStream = {
      _id: streamId,
      id: streamId,
      title: title.trim(),
      description: description || '',
      streamer: streamerId,
      category,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      isLive: true,
      viewerCount: 1,
      peakViewers: 1,
      tags,
      startedAt: new Date(),
    };

    store.streams.set(streamId, newStream);

    res.status(201).json({
      success: true,
      data: {
        ...newStream,
        streamerDetail: sanitizeUser(store.users.get(streamerId)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End Stream
const endStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = store.streams.get(streamId);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    stream.isLive = false;
    stream.endedAt = new Date();

    res.status(200).json({ success: true, message: 'Stream ended successfully', data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listStreams,
  getStreamById,
  createStream,
  endStream,
};
