const express = require('express');
const { searchPodcasts, getBestPodcasts, getPodcastById } = require('../controllers/listenNotesController'); // Import getPodcastById
// Optional: Add authentication middleware if needed
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Define the route for searching podcasts
// Example: GET /api/listennotes/search?query=technology
router.get('/search', searchPodcasts); // Add 'protect' middleware here if authentication is required

// Define the route for getting best podcasts
// Example: GET /api/listennotes/best
router.get('/best', getBestPodcasts); // Add 'protect' middleware here if authentication is required

// Define the route for getting a specific podcast by ID (including episodes)
// Example: GET /api/listennotes/podcasts/some_podcast_id
router.get('/podcasts/:id', getPodcastById); // Add 'protect' middleware here if authentication is required

module.exports = router;
