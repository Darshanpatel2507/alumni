const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user ID.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ────────────────────────────────────────────────────
/**
 * Register a new user.
 * - Students are auto-approved.
 * - Alumni require admin approval (isApproved = false).
 * - Role 'admin' cannot be registered via API (seed only).
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, branch, passingYear } = req.body;

    // Prevent self-registration as admin
    if (role === 'admin') {
      return res.status(400).json({ message: 'Cannot register as admin.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const isApproved = role === 'alumni' ? false : true; // students auto-approved

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      isApproved,
      branch: branch || '',
      passingYear: passingYear || null,
    });

    return res.status(201).json({
      message:
        role === 'alumni'
          ? 'Registration successful! Your account is pending admin approval.'
          : 'Registration successful! You can now sign in.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
/**
 * Login with email + password.
 * Rejects unapproved alumni with a clear message.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Block unapproved alumni
    if (user.role === 'alumni' && !user.isApproved) {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please check back later.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        branch: user.branch,
        passingYear: user.passingYear,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
/**
 * Return the currently authenticated user's profile.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe };
