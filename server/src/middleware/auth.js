const { verifyAccessToken } = require('../utils/jwt');
const store = require('../utils/store');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = store.users.get(decoded.id) || {
      _id: decoded.id,
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = store.users.get(decoded.id) || { _id: decoded.id, id: decoded.id, username: decoded.username, role: decoded.role || 'user' };
    }
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
