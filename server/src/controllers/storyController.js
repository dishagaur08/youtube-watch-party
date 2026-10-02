const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const getStories = async (req, res) => {
  try {
    const stories = Array.from(store.stories.values()).map(s => ({
      ...s,
      userDetail: sanitizeUser(store.users.get(s.user)),
    }));
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { content, mediaUrl, type = 'text', background } = req.body;

    const storyId = 'story_' + Date.now();
    const newStory = {
      _id: storyId,
      id: storyId,
      user: userId,
      type,
      content,
      mediaUrl,
      background: background || 'linear-gradient(135deg, #6366f1, #a855f7)',
      viewers: [],
      createdAt: new Date(),
    };

    store.stories.set(storyId, newStory);

    res.status(201).json({
      success: true,
      data: {
        ...newStory,
        userDetail: sanitizeUser(store.users.get(userId)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStories,
  createStory,
};
