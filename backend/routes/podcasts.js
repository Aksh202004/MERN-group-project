const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Import podcast controller functions
const {
  getPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast
} = require('../controllers/podcastController');

// Route chaining for cleaner code
router.route('/')
  .get(getPodcasts) // GET /api/podcasts
  .post(protect, createPodcast); // POST /api/podcasts (Protected)

router.route('/:id')
  .get(getPodcastById) // GET /api/podcasts/:id
  .put(protect, updatePodcast) // PUT /api/podcasts/:id (Protected)
  .delete(protect, deletePodcast); // DELETE /api/podcasts/:id (Protected)


module.exports = router;
