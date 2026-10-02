const store = require('../utils/store');
const moderationService = require('../services/moderationService');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Get conversations for current user
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const conversations = Array.from(store.conversations.values())
      .filter(c => c.participants && c.participants.includes(currentUserId))
      .map(c => {
        const participantUsers = c.participants.map(id => sanitizeUser(store.users.get(id))).filter(Boolean);
        const lastMsg = c.lastMessage ? store.messages.get(c.lastMessage) : null;
        return {
          ...c,
          participantDetails: participantUsers,
          lastMessageDetail: lastMsg,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or get direct conversation
const createOrGetDirectConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    // Check if direct conversation already exists
    for (const c of store.conversations.values()) {
      if (c.type === 'direct' && c.participants.includes(currentUserId) && c.participants.includes(targetUserId)) {
        const participantUsers = c.participants.map(id => sanitizeUser(store.users.get(id))).filter(Boolean);
        return res.status(200).json({
          success: true,
          data: { ...c, participantDetails: participantUsers },
        });
      }
    }

    // Create new direct conversation
    const convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newConv = {
      _id: convId,
      id: convId,
      type: 'direct',
      participants: [currentUserId, targetUserId],
      admins: [currentUserId],
      lastMessage: null,
      lastMessageAt: new Date(),
      pinnedMessages: [],
      createdAt: new Date(),
    };

    store.conversations.set(convId, newConv);
    const participantUsers = newConv.participants.map(id => sanitizeUser(store.users.get(id))).filter(Boolean);

    res.status(201).json({
      success: true,
      data: { ...newConv, participantDetails: participantUsers },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create group conversation
const createGroupConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { name, description, participantIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const participants = Array.from(new Set([currentUserId, ...participantIds]));
    const convId = 'grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newGroup = {
      _id: convId,
      id: convId,
      type: 'group',
      name: name.trim(),
      description: description || '',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      creator: currentUserId,
      participants,
      admins: [currentUserId],
      lastMessage: null,
      lastMessageAt: new Date(),
      pinnedMessages: [],
      createdAt: new Date(),
    };

    store.conversations.set(convId, newGroup);
    const participantUsers = newGroup.participants.map(id => sanitizeUser(store.users.get(id))).filter(Boolean);

    res.status(201).json({
      success: true,
      data: { ...newGroup, participantDetails: participantUsers },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = Array.from(store.messages.values())
      .filter(m => m.conversationId === conversationId && !m.isDeleted)
      .map(m => ({
        ...m,
        senderDetail: sanitizeUser(store.users.get(m.sender)),
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { conversationId } = req.params;
    const { content, type = 'text', mediaUrl, fileName, fileSize, audioDuration, replyTo } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content or media is required' });
    }

    // Moderation check
    const modResult = await moderationService.filterContent(content || '');
    const cleanContent = modResult.sanitizedText || content;

    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newMsg = {
      _id: msgId,
      id: msgId,
      conversationId,
      sender: currentUserId,
      content: cleanContent,
      type,
      mediaUrl,
      fileName,
      fileSize,
      audioDuration,
      replyTo,
      reactions: [],
      readBy: [{ user: currentUserId, readAt: new Date() }],
      deliveredTo: [currentUserId],
      isEdited: false,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date(),
    };

    store.messages.set(msgId, newMsg);

    // Update conversation lastMessage
    const conv = store.conversations.get(conversationId);
    if (conv) {
      conv.lastMessage = msgId;
      conv.lastMessageAt = new Date();
    }

    const payload = {
      ...newMsg,
      senderDetail: sanitizeUser(store.users.get(currentUserId)),
    };

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload media file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add reaction
const addReaction = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const msg = store.messages.get(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    msg.reactions = msg.reactions || [];
    const existingGroup = msg.reactions.find(r => r.emoji === emoji);

    if (existingGroup) {
      if (existingGroup.users.includes(currentUserId)) {
        existingGroup.users = existingGroup.users.filter(id => id !== currentUserId);
        if (existingGroup.users.length === 0) {
          msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingGroup.users.push(currentUserId);
      }
    } else {
      msg.reactions.push({ emoji, users: [currentUserId] });
    }

    res.status(200).json({ success: true, data: msg.reactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pin / Unpin message
const togglePinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = store.messages.get(messageId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    msg.isPinned = !msg.isPinned;
    const conv = store.conversations.get(msg.conversationId);
    if (conv) {
      conv.pinnedMessages = conv.pinnedMessages || [];
      if (msg.isPinned) {
        if (!conv.pinnedMessages.includes(messageId)) conv.pinnedMessages.push(messageId);
      } else {
        conv.pinnedMessages = conv.pinnedMessages.filter(id => id !== messageId);
      }
    }

    res.status(200).json({ success: true, isPinned: msg.isPinned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConversations,
  createOrGetDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  uploadFile,
  addReaction,
  togglePinMessage,
};
