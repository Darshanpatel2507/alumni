const Event = require('../models/Event');
const User = require('../models/User');

// ── GET /api/events ──────────────────────────────────────────────────────────
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── POST /api/events ─────────────────────────────────────────────────────────
/**
 * Admin only feature
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, type, tag } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      type,
      tag,
      createdBy: req.user._id
    });

    const createdEvent = await event.save();
    
    // Notify all users about the new event
    await User.updateMany(
      {},
      { 
        $push: { 
          notifications: { 
            message: `New Event Scheduled: ${title} on ${date}`, 
            createdAt: new Date() 
          } 
        } 
      }
    );

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── PUT /api/events/:id ──────────────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.time = req.body.time || event.time;
    event.location = req.body.location || event.location;
    event.type = req.body.type || event.type;
    event.tag = req.body.tag || event.tag;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── DELETE /api/events/:id ───────────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
