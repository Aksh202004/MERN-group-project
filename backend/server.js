require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Import DB connection function

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000; // Use port from env or default to 5000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic Route
app.get('/', (req, res) => {
  res.send('Podcast App Backend API Running');
});

// Mount Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/podcasts', require('./routes/podcasts'));
app.use('/api/users', require('./routes/userRoutes')); // Mount user routes
app.use('/api/listennotes', require('./routes/listenNotesRoutes')); // Mount Listen Notes routes

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
