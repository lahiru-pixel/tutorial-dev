const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

// GET /api/students/courses -> get enrolled courses for logged in student
router.get('/courses', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student_id: req.user._id }).populate('course_id');
    const courses = enrollments
      .map(enrollment => enrollment.course_id)
      .filter(course => course !== null);

    res.json(courses);
  } catch (err) {
    console.error('Fetch student courses error:', err);
    res.status(500).json({ error: 'Failed to fetch student courses' });
  }
});

module.exports = router;
