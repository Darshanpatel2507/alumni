const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getPendingAlumni, 
  approveAlumni, 
  rejectAlumni, 
  getAllUsers, 
  deleteUser 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected and restricted to admin
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/pending-alumni', getPendingAlumni);
router.put('/approve/:id', approveAlumni);
router.delete('/reject/:id', rejectAlumni);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
