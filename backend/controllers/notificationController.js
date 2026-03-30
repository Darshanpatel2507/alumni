const User = require('../models/User');

// ── GET /api/notifications ───────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    // Sort descending by date
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'notifications._id': req.params.id },
      { $set: { 'notifications.$.read': true } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(user.notifications.id(req.params.id));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
