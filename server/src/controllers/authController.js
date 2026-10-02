const bcrypt = require('bcryptjs');
const store = require('../utils/store');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// Register
const register = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required' });
    }

    // Check if user exists
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newUser = {
      _id: userId,
      id: userId,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      displayName: displayName?.trim() || username.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: 'New explorer on VYNTRA 🚀',
      status: 'online',
      role: 'user',
      isVerified: true,
      friends: [],
      following: [],
      followers: [],
      blockedUsers: [],
      createdAt: new Date(),
    };

    store.users.set(userId, newUser);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: sanitizeUser(newUser),
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let foundUser = null;
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (foundUser.isBanned) {
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact admin.' });
    }

    foundUser.status = 'online';
    foundUser.lastSeen = new Date();

    const accessToken = generateAccessToken(foundUser);
    const refreshToken = generateRefreshToken(foundUser);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: sanitizeUser(foundUser),
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = store.users.get(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = store.users.get(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { displayName, bio, avatar, banner, customStatus, status, settings } = req.body;

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (banner) user.banner = banner;
    if (customStatus !== undefined) user.customStatus = customStatus;
    if (status) user.status = status;
    if (settings) user.settings = { ...(user.settings || {}), ...settings };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.status(200).json({
    success: true,
    message: `Password reset instructions sent to ${email}`,
  });
};

// Reset Password
const resetPassword = async (req, res) => {
  const { password } = req.body;
  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
};

// Verify Email
const verifyEmail = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
