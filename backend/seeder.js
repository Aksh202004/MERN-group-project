const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars (assuming .env is in the same directory as seeder.js or its parent)
// Adjust the path if your .env file is located elsewhere relative to this script
dotenv.config({ path: './.env' });

// Load models
const Podcast = require('./models/Podcast');
const User = require('./models/User');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder...');
  } catch (err) {
    console.error(`Seeder Connection Error: ${err.message}`);
    process.exit(1);
  }
};

// Sample Data (Creator ID will be added dynamically)
// Replace with actual URLs if desired
const samplePodcasts = [
  {
    title: 'Cosmic Journeys',
    description: 'Exploring the wonders of the universe, from black holes to distant galaxies.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder MP3
    coverImageUrl: 'https://via.placeholder.com/300/09f/fff.png?text=Cosmic', // Placeholder Image
    tags: ['Science', 'Space', 'Astronomy']
  },
  {
    title: 'The History Buffs',
    description: 'Deep dives into pivotal moments and figures in world history.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder MP3
    coverImageUrl: 'https://via.placeholder.com/300/e81/fff.png?text=History', // Placeholder Image
    tags: ['History', 'Education']
  },
  {
    title: 'Tech Simplified',
    description: 'Making complex technology easy to understand. Weekly news and reviews.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder MP3
    coverImageUrl: 'https://via.placeholder.com/300/f90/fff.png?text=Tech', // Placeholder Image
    tags: ['Technology', 'Gadgets']
  },
   {
    title: 'Mindful Moments',
    description: 'Guided meditations and discussions on mindfulness and well-being.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder MP3
    coverImageUrl: 'https://via.placeholder.com/300/2a2/fff.png?text=Mindful', // Placeholder Image
    tags: ['Wellness', 'Meditation', 'Health']
  }
];

// Import into DB
const importData = async () => {
  try {
    await connectDB(); // Ensure connection before operations

    // Find a user to assign as creator
    const user = await User.findOne(); // Find the first user
    if (!user) {
      console.error('\nError: No users found in the database. Cannot assign creator.');
      console.error('Please create a user before running the seeder with -i.');
      mongoose.connection.close();
      process.exit(1);
    }
    console.log(`\nFound user "${user.name}" (${user._id}) to assign as creator.`);

    // Add the creator ID to sample data
    const podcastsWithCreator = samplePodcasts.map(p => ({ ...p, creator: user._id }));

    // Removed the line that deletes existing podcasts:
    // await Podcast.deleteMany();
    // console.log('Existing podcasts deleted.');

    // Insert sample podcasts
    await Podcast.insertMany(podcastsWithCreator);
    console.log('Sample podcast data imported successfully!');

    mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error('\nImport Error:', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
     await connectDB(); // Ensure connection before operations

    await Podcast.deleteMany();
    console.log('\nAll podcast data destroyed successfully!');

    mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error('\nDelete Error:', err);
     mongoose.connection.close();
    process.exit(1);
  }
};

// Command line arguments processing
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('\nUsage:');
  console.log('  node seeder -i   (to import sample podcast data)');
  console.log('  node seeder -d   (to delete all podcast data)');
  process.exit();
}
