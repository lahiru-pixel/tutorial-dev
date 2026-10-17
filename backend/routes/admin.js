const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const Enrollment = require('../models/Enrollment');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

router.use(authenticate, isAdmin);

// GET /api/admin/students -> all students + paid status
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ created_at: -1 });
    res.json(students);
  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// PUT /api/admin/students/:id/pay -> mark student as paid/unpaid
router.put('/students/:id/pay', async (req, res) => {
  try {
    const { is_paid } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      {
        is_paid: Boolean(is_paid),
        paid_at: is_paid ? new Date() : null,
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Update student paid status error:', err);
    res.status(500).json({ error: 'Failed to update student status' });
  }
});

// POST /api/admin/enroll -> enroll student into course
router.post('/enroll', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) {
      return res.status(400).json({ error: 'Student ID and Course ID are required' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { student_id, course_id },
      { student_id, course_id, enrolled_by: req.user._id, enrolled_at: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(enrollment);
  } catch (err) {
    console.error('Enroll student error:', err);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
});

// DELETE /api/admin/enroll -> remove enrollment
router.delete('/enroll', async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    await Enrollment.findOneAndDelete({ student_id, course_id });
    res.json({ success: true });
  } catch (err) {
    console.error('Remove enrollment error:', err);
    res.status(500).json({ error: 'Failed to remove enrollment' });
  }
});

// GET /api/admin/dashboard -> stats overview
router.get('/dashboard', async (req, res) => {
  try {
    const total_students = await User.countDocuments({ role: 'student' });
    const total_paid = await User.countDocuments({ role: 'student', is_paid: true });
    const total_courses = await Course.countDocuments({});

    res.json({
      total_students,
      total_paid,
      total_courses,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/courses -> get all courses (including unpublished)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ created_at: -1 });
    res.json(courses);
  } catch (err) {
    console.error('Fetch admin courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/admin/courses -> create course
router.post('/courses', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.json(course);
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PUT /api/admin/courses/:id -> edit course
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/admin/courses/:id -> delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    // Cascade delete associated videos and enrollments
    await Video.deleteMany({ course_id: req.params.id });
    await Enrollment.deleteMany({ course_id: req.params.id });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// GET /api/admin/videos -> get all videos (can be filtered by course_id)
router.get('/videos', async (req, res) => {
  try {
    const filter = {};
    if (req.query.course_id) {
      filter.course_id = req.query.course_id;
    }
    const videos = await Video.find(filter).sort({ order_index: 1 });
    res.json(videos);
  } catch (err) {
    console.error('Fetch admin videos error:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// POST /api/admin/videos -> add video to course
router.post('/videos', async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.json(video);
  } catch (err) {
    console.error('Create video error:', err);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// PUT /api/admin/videos/:id -> edit video
router.put('/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// DELETE /api/admin/videos/:id -> delete video
router.delete('/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// GET /api/admin/enrollments -> get all enrollments
router.get('/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('course_id')
      .populate('student_id')
      .sort({ enrolled_at: -1 });

    const formatted = enrollments.map(e => ({
      id: e._id.toString(),
      student_id: e.student_id ? e.student_id._id.toString() : null,
      course_id: e.course_id ? e.course_id._id.toString() : null,
      enrolled_at: e.enrolled_at,
      profiles: e.student_id ? e.student_id.toJSON() : null,
      courses: e.course_id ? e.course_id.toJSON() : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Fetch enrollments error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

module.exports = router;
