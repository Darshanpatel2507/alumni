const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers, getUserById } = require('../controllers/userController');
const { protect, approvedOnly } = require('../middleware/auth');

// Profile routes (Any authenticated user can update their own profile)
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Directory routes (Searching other users, needs approval if alumni)
router.route('/')
  .get(protect, approvedOnly, getUsers);

router.route('/:id')
  .get(protect, approvedOnly, getUserById);

module.exports = router;
