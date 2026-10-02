const store = require('../utils/store');

const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const notifs = Array.from(store.notifications.values())
      .filter(n => n.recipient === currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: notifs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = store.notifications.get(id);
    if (notif) notif.isRead = true;
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearAll = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    for (const [id, notif] of store.notifications.entries()) {
      if (notif.recipient === currentUserId) {
        store.notifications.delete(id);
      }
    }
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  clearAll,
};
