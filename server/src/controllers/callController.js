const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Initiate call log
const initiateCall = async (req, res) => {
  try {
    const callerId = req.user._id || req.user.id;
    const { receiverId, conversationId, type = 'video' } = req.body;

    const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newCall = {
      _id: callId,
      id: callId,
      caller: callerId,
      receiver: receiverId,
      conversationId,
      type,
      status: 'ringing',
      startedAt: new Date(),
      duration: 0,
      createdAt: new Date(),
    };

    store.calls.set(callId, newCall);

    res.status(201).json({
      success: true,
      data: {
        ...newCall,
        callerDetail: sanitizeUser(store.users.get(callerId)),
        receiverDetail: receiverId ? sanitizeUser(store.users.get(receiverId)) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get call history
const getCallHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const calls = Array.from(store.calls.values())
      .filter(c => c.caller === currentUserId || c.receiver === currentUserId)
      .map(c => ({
        ...c,
        callerDetail: sanitizeUser(store.users.get(c.caller)),
        receiverDetail: sanitizeUser(store.users.get(c.receiver)),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateCall,
  getCallHistory,
};
