const axios = require('axios');

// @desc    Search podcasts on Listen Notes
// @route   GET /api/listennotes/search?q=...
// @access  Public (or Private, depending on your app's logic)
const searchPodcasts = async (req, res) => {
  const { q } = req.query; // Get search query from request query parameters (using 'q')

  if (!q) { // Check for 'q' instead of 'query'
    return res.status(400).json({ message: 'Search query (q) is required' }); // Updated error message
  }

  try {
    const response = await axios.get('https://listen-api.listennotes.com/api/v2/search', {
      headers: {
        'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
      },
      params: {
        q: q, // Pass 'q' to the Listen Notes API
        type: 'podcast', // Search for podcasts specifically
        // Add other parameters as needed, e.g., sort_by_date, genre_ids, etc.
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Listen Notes API:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: 'Failed to fetch podcasts from Listen Notes',
      error: error.response ? error.response.data : error.message,
    });
  }
};

// @desc    Get best podcasts from Listen Notes
// @route   GET /api/listennotes/best
// @access  Public
const getBestPodcasts = async (req, res) => {
  try {
    // You can add parameters like genre_id, page, region, safe_mode if needed
    const response = await axios.get('https://listen-api.listennotes.com/api/v2/best_podcasts', {
      headers: {
        'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
      },
      params: {
        // Add parameters here, e.g., page: 1, region: 'us'
        // region: 'in' // Example: Get podcasts popular in India
      },
    });

    res.json(response.data); // Send the list of podcasts
  } catch (error) {
    console.error('Error fetching best podcasts from Listen Notes API:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: 'Failed to fetch best podcasts from Listen Notes',
      error: error.response ? error.response.data : error.message,
    });
  }
};

// @desc    Get podcast details (including episodes) by ID from Listen Notes
// @route   GET /api/listennotes/podcasts/:id
// @access  Public
const getPodcastById = async (req, res) => {
  const { id } = req.params; // Get podcast ID from URL parameters

  if (!id) {
    return res.status(400).json({ message: 'Podcast ID is required' });
  }

  try {
    // Fetch podcast details, including episodes. Sort by recent first.
    const response = await axios.get(`https://listen-api.listennotes.com/api/v2/podcasts/${id}`, {
      headers: {
        'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
      },
      params: {
        sort: 'recent_first', // Get latest episodes first
      },
    });

    res.json(response.data); // Send the full podcast details object
  } catch (error) {
    console.error(`Error fetching podcast ${id} from Listen Notes API:`, error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: `Failed to fetch podcast ${id} from Listen Notes`,
      error: error.response ? error.response.data : error.message,
    });
  }
};


module.exports = {
  searchPodcasts,
  getBestPodcasts,
  getPodcastById, // Export the new function
};
