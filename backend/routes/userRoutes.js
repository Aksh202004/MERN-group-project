const express = require('express');
const router = express.Router(); // Define the router
const { protect } = require('../middleware/authMiddleware');
// const multer = require('multer'); // No longer needed

// Import user controller functions
const {
  likePodcast,
  unlikePodcast,
  getLikedPodcasts,
  getUserProfile,
  updateUserProfile,
  updateUserPassword
} = require('../controllers/userController');

// Configure multer - NO LONGER NEEDED FOR URL
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// --- User Library Routes ---

// GET /api/users/library - Get liked podcasts (user's library)
router.get('/library', protect, getLikedPodcasts);

// PUT /api/users/like/:podcastId - Like a podcast
router.put('/like/:podcastId', protect, likePodcast);

// PUT /api/users/unlike/:podcastId - Unlike a podcast
router.put('/unlike/:podcastId', protect, unlikePodcast);

// --- User Profile Routes ---

// GET /api/users/profile - Get user profile
// PUT /api/users/profile - Update user profile (handles name, email, and profilePictureUrl)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // Removed multer middleware

// --- Change Password Route ---

// PUT /api/users/profile/password - Update user password
router.put('/profile/password', protect, updateUserPassword);

module.exports = router;
