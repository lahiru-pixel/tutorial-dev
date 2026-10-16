const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Video = require('../models/Video');

// GET /api/courses -> list published courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ is_published: true }).sort({ created_at: -1 });
    res.json(courses);
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id -> course details + video list (without exposing secure links)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const videos = await Video.find({ course_id: req.params.id })
      .select('id title description order_index duration_text created_at')
      .sort({ order_index: 1 });

    res.json({ ...course.toJSON(), videos });
  } catch (err) {
    console.error('Fetch course details error:', err);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

module.exports = router;
