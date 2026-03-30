const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');

// ── GET /api/admin/stats ───────────────────────────────────────────────────────
/**
 * Dashboard stats: total users, pending alumni, total posts, total events.
 */
const getStats = async (req, res) => {
  try {
    const [totalUsers, pendingAlumni, totalPosts, totalEvents, totalAlumni, totalStudents] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'alumni', isApproved: false }),
        Post.countDocuments(),
        Event.countDocuments(),
        User.countDocuments({ role: 'alumni', isApproved: true }),
        User.countDocuments({ role: 'student' }),
      ]);

    res.json({ totalUsers, pendingAlumni, totalPosts, totalEvents, totalAlumni, totalStudents });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── GET /api/admin/pending-alumni ─────────────────────────────────────────────
/**
 * List all alumni awaiting approval.
 */
const getPendingAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni', isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── PUT /api/admin/approve/:id ────────────────────────────────────────────────
/**
 * Approve an alumni account and send a notification.
 */
const approveAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found.' });
    }

    user.isApproved = true;
    user.notifications.push({
      message: '🎉 Your alumni account has been approved! You can now log in.',
    });
    await user.save();

    res.json({ message: `${user.name}'s account approved successfully.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── DELETE /api/admin/reject/:id ──────────────────────────────────────────────
/**
 * Reject (delete) an unapproved alumni account.
 */
const rejectAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found.' });
    }

    await user.deleteOne();
    res.json({ message: `${user.name}'s registration has been rejected and removed.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
/**
 * List all users (excluding admins). Supports ?role= filter.
 */
const getAllUsers = async (req, res) => {
  try {
    const filter = { role: { $ne: 'admin' } };
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
/**
 * Delete any user (admin power).
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin account.' });
    }
    await user.deleteOne();
    res.json({ message: `User ${user.name} deleted.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStats, getPendingAlumni, approveAlumni, rejectAlumni, getAllUsers, deleteUser };
