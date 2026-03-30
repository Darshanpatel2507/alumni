const User = require('../models/User');

// ── GET /api/users/profile ───────────────────────────────────────────────────
/**
 * Get current user profile (alternative to auth/me)
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── PUT /api/users/profile ───────────────────────────────────────────────────
/**
 * Update user profile (name, branch, passingYear, bio, company, location, etc.)
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.branch = req.body.branch || user.branch;
      user.passingYear = req.body.passingYear || user.passingYear;
      user.bio = req.body.bio || user.bio;
      user.company = req.body.company || user.company;
      user.location = req.body.location || user.location;
      user.linkedIn = req.body.linkedIn || user.linkedIn;
      if (req.body.skills) {
        user.skills = req.body.skills;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        branch: updatedUser.branch,
        passingYear: updatedUser.passingYear,
        bio: updatedUser.bio,
        company: updatedUser.company,
        location: updatedUser.location,
        linkedIn: updatedUser.linkedIn,
        skills: updatedUser.skills
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── GET /api/users ───────────────────────────────────────────────────────────
/**
 * Get all users, allows filtering by role, branch, passingYear, name
 */
const getUsers = async (req, res) => {
  try {
    const { role, branch, passingYear, search } = req.query;
    
    // Only show approved alumni and students (hide admins)
    const filter = { 
      role: { $ne: 'admin' },
      $or: [
        { role: 'student' },
        { role: 'alumni', isApproved: true }
      ]
    };

    if (role) filter.role = role;
    if (branch) filter.branch = { $regex: branch, $options: 'i' };
    if (passingYear) filter.passingYear = Number(passingYear);
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(filter).select('-password -notifications');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── GET /api/users/:id ───────────────────────────────────────────────────────
/**
 * Get a specific user by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notifications');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, getUsers, getUserById };
