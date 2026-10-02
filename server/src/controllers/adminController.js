const store = require('../utils/store');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Admin Overview Metrics
const getMetrics = async (req, res) => {
  try {
    const totalUsers = store.users.size;
    const activeUsers = Array.from(store.users.values()).filter(u => u.status === 'online').length;
    const totalMessages = store.messages.size;
    const totalCommunities = store.communities.size;
    const totalStreams = store.streams.size;
    const liveStreams = Array.from(store.streams.values()).filter(s => s.isLive).length;
    const activeGameRooms = store.gameRooms.size;
    const totalDocuments = store.documents.size;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalMessages,
        totalCommunities,
        totalStreams,
        liveStreams,
        activeGameRooms,
        totalDocuments,
        aiQueriesProcessed: 1420,
        systemHealth: '100% Operational',
        uptime: process.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all users
const listUsers = async (req, res) => {
  try {
    const users = Array.from(store.users.values()).map(sanitizeUser);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ban / Unban user
const toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = store.users.get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBanned = !user.isBanned;

    // Log admin audit action
    const logId = 'log_' + Date.now();
    store.auditLogs.set(logId, {
      _id: logId,
      actor: req.user._id || req.user.id,
      action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
      targetType: 'user',
      targetId: userId,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List Reports
const listReports = async (req, res) => {
  try {
    const reports = Array.from(store.reports.values()).map(r => ({
      ...r,
      reporterDetail: sanitizeUser(store.users.get(r.reporter)),
    }));
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve Report
const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status = 'resolved', resolutionNotes } = req.body;

    const report = store.reports.get(reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status;
    report.resolutionNotes = resolutionNotes;
    report.resolvedBy = req.user._id || req.user.id;

    res.status(200).json({ success: true, message: 'Report updated', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List Audit Logs
const listAuditLogs = async (req, res) => {
  try {
    const logs = Array.from(store.auditLogs.values())
      .map(l => ({
        ...l,
        actorDetail: sanitizeUser(store.users.get(l.actor)),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMetrics,
  listUsers,
  toggleBanUser,
  listReports,
  resolveReport,
  listAuditLogs,
};
