const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const allUsers = Array.from(store.users.values())
        .filter(u => u._id !== (req.user?._id || req.user?.id))
        .map(sanitizeUser);
      return res.status(200).json({ success: true, data: allUsers });
    }

    const q = query.toLowerCase();
    const results = Array.from(store.users.values())
      .filter(u => 
        u._id !== (req.user?._id || req.user?.id) &&
        (u.username.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q))
      )
      .map(sanitizeUser);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID or username
const getUserProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    let found = store.users.get(identifier);

    if (!found) {
      for (const u of store.users.values()) {
        if (u.username.toLowerCase() === identifier.toLowerCase()) {
          found = u;
          break;
        }
      }
    }

    if (!found) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: sanitizeUser(found) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send friend request / Add Friend
const sendFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { targetUserId } = req.body;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot add yourself as a friend' });
    }

    const currentUser = store.users.get(currentUserId);
    const targetUser = store.users.get(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    if (!currentUser.friends.includes(targetUserId)) {
      currentUser.friends.push(targetUserId);
    }
    if (!targetUser.friends.includes(currentUserId)) {
      targetUser.friends.push(currentUserId);
    }

    // Add notification
    const notifId = 'notif_' + Date.now();
    store.notifications.set(notifId, {
      _id: notifId,
      recipient: targetUserId,
      sender: currentUserId,
      type: 'friend_accept',
      title: 'New Friend Connected',
      body: `${currentUser.displayName || currentUser.username} added you as a friend.`,
      isRead: false,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Friend connected successfully',
      data: sanitizeUser(targetUser),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow / Unfollow user
const toggleFollow = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { targetUserId } = req.params;

    const currentUser = store.users.get(currentUserId);
    const targetUser = store.users.get(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following?.includes(targetUserId);
    if (isFollowing) {
      currentUser.following = (currentUser.following || []).filter(id => id !== targetUserId);
      targetUser.followers = (targetUser.followers || []).filter(id => id !== currentUserId);
    } else {
      currentUser.following = currentUser.following || [];
      targetUser.followers = targetUser.followers || [];
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      message: isFollowing ? 'Unfollowed successfully' : 'Following successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Block / Unblock user
const toggleBlock = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { targetUserId } = req.params;

    const currentUser = store.users.get(currentUserId);
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    currentUser.blockedUsers = currentUser.blockedUsers || [];
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== targetUserId);
    } else {
      currentUser.blockedUsers.push(targetUserId);
    }

    res.status(200).json({
      success: true,
      isBlocked: !isBlocked,
      message: isBlocked ? 'User unblocked' : 'User blocked',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const currentUser = store.users.get(currentUserId);
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    const friendsList = (currentUser.friends || [])
      .map(id => store.users.get(id))
      .filter(Boolean)
      .map(sanitizeUser);

    res.status(200).json({ success: true, data: friendsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  sendFriendRequest,
  toggleFollow,
  toggleBlock,
  getFriends,
};
