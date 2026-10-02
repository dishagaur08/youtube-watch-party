const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// List all public communities + user joined communities
const listCommunities = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const list = Array.from(store.communities.values()).map(c => {
      const channels = Array.from(store.channels.values()).filter(ch => ch.communityId === c._id);
      const isMember = currentUserId ? (c.members || []).some(m => m.user === currentUserId) : false;
      return {
        ...c,
        memberCount: (c.members || []).length,
        channels,
        isMember,
      };
    });

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Community
const createCommunity = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { name, description, isPrivate, icon, banner } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Community name is required' });
    }

    const commId = 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newComm = {
      _id: commId,
      id: commId,
      name: name.trim(),
      description: description || 'A new VYNTRA community.',
      icon: icon || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      banner: banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      owner: currentUserId,
      isPrivate: !!isPrivate,
      members: [{ user: currentUserId, role: 'owner', joinedAt: new Date() }],
      inviteCode: (name.substring(0, 4) + '-' + Math.random().toString(36).substring(2, 6)).toUpperCase(),
      createdAt: new Date(),
    };

    store.communities.set(commId, newComm);

    // Create default text & voice channels
    const ch1 = { _id: 'chan_' + Date.now() + '_1', communityId: commId, name: 'general', type: 'text', category: 'Text Channels', position: 0 };
    const ch2 = { _id: 'chan_' + Date.now() + '_2', communityId: commId, name: 'Voice Lounge', type: 'voice', category: 'Voice Rooms', position: 1 };
    store.channels.set(ch1._id, ch1);
    store.channels.set(ch2._id, ch2);

    res.status(201).json({
      success: true,
      data: {
        ...newComm,
        channels: [ch1, ch2],
        memberCount: 1,
        isMember: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join Community
const joinCommunity = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { communityId } = req.params;

    const comm = store.communities.get(communityId);
    if (!comm) return res.status(404).json({ success: false, message: 'Community not found' });

    const exists = comm.members.some(m => m.user === currentUserId);
    if (!exists) {
      comm.members.push({ user: currentUserId, role: 'member', joinedAt: new Date() });
    }

    res.status(200).json({ success: true, message: 'Joined community successfully', data: comm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Channel in community
const createChannel = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { name, type = 'text', category = 'Text Channels' } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Channel name is required' });

    const chanId = 'chan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newChan = {
      _id: chanId,
      id: chanId,
      communityId,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
      category,
      position: 10,
      createdAt: new Date(),
    };

    store.channels.set(chanId, newChan);
    res.status(201).json({ success: true, data: newChan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get channels of community
const getCommunityChannels = async (req, res) => {
  try {
    const { communityId } = req.params;
    const channels = Array.from(store.channels.values()).filter(c => c.communityId === communityId);
    res.status(200).json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listCommunities,
  createCommunity,
  joinCommunity,
  createChannel,
  getCommunityChannels,
};
