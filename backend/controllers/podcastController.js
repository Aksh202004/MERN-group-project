const Podcast = require('../models/Podcast');
const User = require('../models/User'); // May need for creator info later

// @desc    Fetch all podcasts
// @route   GET /api/podcasts
// @access  Public
const getPodcasts = async (req, res, next) => {
  try {
    // Optionally add pagination, filtering, sorting later
    const podcasts = await Podcast.find({}).populate('creator', 'name'); // Populate creator's name
    res.status(200).json({ success: true, count: podcasts.length, data: podcasts });
  } catch (error) {
    console.error('Get Podcasts Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching podcasts' });
  }
};

// @desc    Fetch single podcast by ID
// @route   GET /api/podcasts/:id
// @access  Public
const getPodcastById = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id).populate('creator', 'name'); // Populate creator's name

    if (!podcast) {
      return res.status(404).json({ success: false, message: `Podcast not found with id of ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: podcast });
  } catch (error) {
    console.error(`Get Podcast By ID Error (${req.params.id}):`, error);
     // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
         return res.status(400).json({ success: false, message: `Invalid Podcast ID format: ${req.params.id}` });
    }
    res.status(500).json({ success: false, message: 'Server Error fetching podcast' });
  }
};

// @desc    Create a podcast
// @route   POST /api/podcasts
// @access  Private
const createPodcast = async (req, res, next) => {
  // Add user from protect middleware to the request body
  req.body.creator = req.user.id;

  try {
    const podcast = await Podcast.create(req.body);
    res.status(201).json({ success: true, data: podcast });
  } catch (error) {
    console.error('Create Podcast Error:', error);
    // Basic error handling, consider more specific checks
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error creating podcast' });
  }
};

// @desc    Update a podcast
// @route   PUT /api/podcasts/:id
// @access  Private
const updatePodcast = async (req, res, next) => {
  try {
    let podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ success: false, message: `Podcast not found with id of ${req.params.id}` });
    }

    // Make sure user is the podcast creator
    // podcast.creator is an ObjectId, req.user.id is a string
    if (podcast.creator.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized to update this podcast' });
    }

    // Update the podcast
    podcast = await Podcast.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the modified document
      runValidators: true, // Run schema validators on update
    });

    res.status(200).json({ success: true, data: podcast });
  } catch (error) {
    console.error(`Update Podcast Error (${req.params.id}):`, error);
     // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
         return res.status(400).json({ success: false, message: `Invalid Podcast ID format: ${req.params.id}` });
    }
    // Handle validation errors during update
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error updating podcast' });
  }
};

// @desc    Delete a podcast
// @route   DELETE /api/podcasts/:id
// @access  Private
const deletePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ success: false, message: `Podcast not found with id of ${req.params.id}` });
    }

    // Make sure user is the podcast creator
    if (podcast.creator.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this podcast' });
    }

    // Use deleteOne or remove (deleteOne is generally preferred)
    await podcast.deleteOne(); // Or await Podcast.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} }); // Return empty object on successful deletion
  } catch (error) {
    console.error(`Delete Podcast Error (${req.params.id}):`, error);
     // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
         return res.status(400).json({ success: false, message: `Invalid Podcast ID format: ${req.params.id}` });
    }
    res.status(500).json({ success: false, message: 'Server Error deleting podcast' });
  }
};


module.exports = {
  getPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
};
