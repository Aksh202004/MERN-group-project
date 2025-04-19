const mongoose = require('mongoose');

const PodcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    // required: [true, 'Please add a description'], // Make optional for external
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  // audioUrl: { // This belongs to episodes, not the podcast itself usually
  //   type: String,
  //   // required: [true, 'Please add an audio file URL'], // Make optional
  // },
  image: { // Renamed from coverImageUrl
    type: String,
    // Optional: Add default image URL or validation
  },
  publisherName: { // Store publisher name from external source
    type: String,
    trim: true,
  },
  creator: { // Link to local user if created locally
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to the User model
    // required: true, // Make optional
  },
  externalId: { // Store the ID from the external source (e.g., Listen Notes)
    type: String,
    index: true, // Add index for faster lookups
    unique: true, // Ensure external IDs are unique if present
    sparse: true, // Allow multiple documents without this field (for local podcasts)
  },
  source: { // Indicate the origin of the podcast data
    type: String,
    enum: ['local', 'listenNotes'], // Define possible sources
    default: 'local', // Default to local if not specified
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optional fields: duration, genre, tags, listenCount, etc.
});

module.exports = mongoose.model('Podcast', PodcastSchema);
