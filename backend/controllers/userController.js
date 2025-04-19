const mongoose = require('mongoose'); // Import mongoose
const User = require('../models/User');
const Podcast = require('../models/Podcast'); // Needed to validate/create podcast entries

// @desc    Add a podcast (local or external) to the user's liked list
// @route   PUT /api/users/like/:podcastId
// @access  Private
const likePodcast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const idParam = req.params.podcastId; // Could be Mongo ObjectId or Listen Notes ID
    let mongoPodcastId; // Variable to hold the MongoDB ObjectId to add to user's likes

    // Check if idParam is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      // --- Handle Liking a Local Podcast ---
      const podcastExists = await Podcast.findById(idParam);
      if (!podcastExists || podcastExists.source !== 'local') { // Ensure it's a local podcast
        return res.status(404).json({ success: false, message: 'Local podcast not found with this ID' });
      }
      mongoPodcastId = idParam; // Use the provided ObjectId

    } else {
      // --- Handle Liking an External (Listen Notes) Podcast ---
      const externalId = idParam;
      const { title, image, publisherName } = req.body; // Get details from frontend

      // Validate required details for creating a local representation
      if (!title || !image || !publisherName) {
        return res.status(400).json({ success: false, message: 'Missing podcast details (title, image, publisherName) in request body for external like' });
      }

      // Find if a local representation already exists
      let localPodcast = await Podcast.findOne({ externalId: externalId, source: 'listenNotes' });

      if (!localPodcast) {
        // Create a new local representation if it doesn't exist
        try {
          localPodcast = await Podcast.create({
            externalId: externalId,
            source: 'listenNotes',
            title: title,
            image: image,
            publisherName: publisherName,
            // Description can be added later if needed
          });
          console.log(`Created local entry for external podcast: ${externalId}`);
        } catch (createError) {
           // Handle potential unique constraint error if race condition occurs
           if (createError.code === 11000) {
               console.warn(`Race condition likely: Podcast with externalId ${externalId} already exists.`);
               localPodcast = await Podcast.findOne({ externalId: externalId, source: 'listenNotes' });
               if (!localPodcast) { // If still not found after race condition, something is wrong
                   throw createError; // Re-throw original error
               }
           } else {
               throw createError; // Re-throw other creation errors
           }
        }
      }
      mongoPodcastId = localPodcast._id; // Use the ObjectId of the local representation
    }

    // Add the determined MongoDB ObjectId to the user's liked list
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { likedPodcasts: mongoPodcastId } },
      { new: true, runValidators: true }
    ).populate({ // Populate to return the full liked list details if needed later
        path: 'likedPodcasts',
        populate: { path: 'creator', select: 'name' } // Example population
    }).select('likedPodcasts'); // Select only the array

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.likedPodcasts });

  } catch (error) {
    console.error('Like Podcast Error:', error);
     // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
         return res.status(400).json({ success: false, message: `Invalid ID format` });
    }
    res.status(500).json({ success: false, message: 'Server Error liking podcast' });
  }
};

// @desc    Remove a podcast (local or external) from the user's liked list
// @route   PUT /api/users/unlike/:podcastId
// @access  Private
const unlikePodcast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const idParam = req.params.podcastId;
    let mongoPodcastId;

    // Check if idParam is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      // --- Handle Unliking a Local Podcast ---
      // Optional: Validate if the podcast actually exists
      // const podcastExists = await Podcast.findById(idParam);
      // if (!podcastExists) { ... }
      mongoPodcastId = idParam;

    } else {
      // --- Handle Unliking an External (Listen Notes) Podcast ---
      const externalId = idParam;
      // Find the local representation based on the external ID
      const localPodcast = await Podcast.findOne({ externalId: externalId, source: 'listenNotes' });

      if (!localPodcast) {
        // Podcast not found locally, maybe never liked or already unliked/deleted
        // Proceeding to $pull won't hurt, but good to know it wasn't found
        console.log(`Local representation for external podcast ${externalId} not found during unlike.`);
        // We can't get a mongoPodcastId, so the $pull below might not remove anything if the user's array somehow still has it, but that's okay.
        // Alternatively, return a specific status or message? For now, let $pull handle it.
        // Let's try to return the current list without attempting pull if not found
         const currentUser = await User.findById(userId).select('likedPodcasts');
         return res.status(200).json({ success: true, data: currentUser.likedPodcasts });
      }
      mongoPodcastId = localPodcast._id; // Get the ObjectId of the local representation
    }

    // Remove the determined MongoDB ObjectId from the user's liked list
    // Note: If mongoPodcastId is undefined (because external wasn't found), $pull won't do anything.
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { likedPodcasts: mongoPodcastId } },
      { new: true }
    ).populate({ // Populate to return the full liked list details if needed later
        path: 'likedPodcasts',
        populate: { path: 'creator', select: 'name' } // Example population
    }).select('likedPodcasts');

     if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.likedPodcasts });

  } catch (error) {
    console.error('Unlike Podcast Error:', error);
     // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
         return res.status(400).json({ success: false, message: `Invalid ID format` });
    }
    res.status(500).json({ success: false, message: 'Server Error unliking podcast' });
  }
};

// @desc    Get the logged-in user's liked podcasts
// @route   GET /api/users/library
// @access  Private
const getLikedPodcasts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the user and populate the likedPodcasts field
    // Also populate the creator within each liked podcast
    const user = await User.findById(userId)
        .select('likedPodcasts') // Select only the likedPodcasts field of the user
        .populate({
            path: 'likedPodcasts', // Populate the likedPodcasts array
            populate: {
                path: 'creator', // Within each podcast, populate the creator
                select: 'name' // Only select the creator's name
            }
        });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user.likedPodcasts });

  } catch (error) {
    console.error('Get Liked Podcasts Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching library' });
  }
};


module.exports = {
  likePodcast,
  unlikePodcast,
  getLikedPodcasts,
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching profile' });
  }
};

// @desc    Update user profile (name, email)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  // Note: We removed multer, so req.file won't exist.
  // We expect profilePictureUrl in the body now.
  try {
    const { name, email, profilePictureUrl } = req.body; // Get URL from body
    const userId = req.user.id;

    // Find user first
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is being changed and if it already exists for another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update profile picture URL if provided
    // Add validation here if needed (e.g., check if it's a valid URL format)
    if (profilePictureUrl !== undefined) { // Check if field exists (even if empty string)
       user.profilePictureUrl = profilePictureUrl;
    }


    const updatedUser = await user.save(); // Save changes

    res.status(200).json({
      success: true,
      data: { // Return updated user info (excluding password)
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePictureUrl: updatedUser.profilePictureUrl // Include the URL in the response
      }
    });

  } catch (error) {
    console.error('Update User Profile Error:', error);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error updating profile' });
  }
};


// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updateUserPassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
     if (newPassword.length < 6) {
         return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
     }

    try {
        // Find user and select password (it's excluded by default)
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        // Set new password (pre-save hook in User model will hash it)
        user.password = newPassword;
        await user.save();

        // Respond without sending user data, just success
        res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ success: false, message: 'Server Error updating password' });
    }
};


module.exports = {
  likePodcast,
  unlikePodcast,
  getLikedPodcasts,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};
