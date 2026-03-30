const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, adminOnly, approvedOnly } = require('../middleware/auth');

// Anyone authenticated (and approved) can view events
router.route('/')
  .get(protect, approvedOnly, getEvents)
  .post(protect, adminOnly, createEvent);

router.route('/:id')
  .put(protect, adminOnly, updateEvent)
  .delete(protect, adminOnly, deleteEvent);

module.exports = router;
