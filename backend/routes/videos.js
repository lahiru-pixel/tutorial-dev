const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const authenticate = require('../middleware/authenticate');
const isEnrolled = require('../middleware/isEnrolled');

// GET /api/videos/:id/watch -> returns youtube_url only if authorized
// Requires valid JWT + is_paid=true + enrolled (or admin)
router.get('/:id/watch', authenticate, isEnrolled, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('id title youtube_url description');
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Fetch video watch error:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

module.exports = router;
