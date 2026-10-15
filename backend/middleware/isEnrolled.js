const Video = require('../models/Video');
const Enrollment = require('../models/Enrollment');

const isEnrolled = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Admins bypass enrollment check
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.is_paid) {
      return res.status(403).json({ error: 'Forbidden: User has not paid' });
    }

    let courseId = req.params.courseId;

    // If accessing a video route like /api/videos/:id/watch
    if (!courseId && req.baseUrl.includes('/videos') && req.params.id) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      courseId = video.course_id;
    } else if (!courseId && req.params.id) {
      // Fallback if the route is /api/courses/:id
      courseId = req.params.id;
    }

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID missing for enrollment check' });
    }

    const enrollment = await Enrollment.findOne({
      student_id: req.user._id,
      course_id: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Forbidden: Not enrolled in this course' });
    }

    next();
  } catch (err) {
    console.error('Enrollment middleware error:', err);
    res.status(500).json({ error: 'Internal server error checking enrollment' });
  }
};

module.exports = isEnrolled;
