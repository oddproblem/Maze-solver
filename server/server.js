// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing to allow our React app to communicate with the server
app.use(cors());
// Enable express to parse JSON bodies in POST/PUT requests
app.use(express.json());

// --- MongoDB Connection ---
// IMPORTANT: Replace this with your actual MongoDB connection string.
// You can get a free one from MongoDB Atlas.
const MONGO_URI = 'mongodb://localhost:27017/maze-solver';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema & Model ---
// This defines the structure of the maze data we will store in MongoDB.
const MazeSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  gridSize: {
    type: Number,
    required: true,
  },
  startNode: {
    row: Number,
    col: Number,
  },
  endNode: {
    row: Number,
    col: Number,
  },
  walls: {
    type: [[Number]], // Array of [row, col] pairs
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Maze = mongoose.model('Maze', MazeSchema);

// --- API Routes ---

/**
 * @route   POST /api/mazes
 * @desc    Save a new maze configuration to the database
 * @access  Public
 */
app.post('/api/mazes', async (req, res) => {
  try {
    const { gridSize, startNode, endNode, walls } = req.body;

    // Basic validation
    if (!gridSize || !startNode || !endNode || !walls) {
      return res.status(400).json({ msg: 'Please provide all required maze data.' });
    }

    const newMaze = new Maze({
      gridSize,
      startNode,
      endNode,
      walls,
    });

    const savedMaze = await newMaze.save();
    
    // Respond with the saved maze data, including its unique ID
    res.status(201).json(savedMaze);

  } catch (err) {
    console.error('Error saving maze:', err);
    res.status(500).json({ error: 'Server error while saving maze.' });
  }
});

/**
 * @route   GET /api/mazes/:id
 * @desc    Retrieve a saved maze by its unique ID
 * @access  Public
 */
app.get('/api/mazes/:id', async (req, res) => {
  try {
    const maze = await Maze.findById(req.params.id);

    if (!maze) {
      return res.status(404).json({ msg: 'Maze not found with this ID.' });
    }

    res.json(maze);

  } catch (err) {
    console.error('Error fetching maze:', err);
    // Handle cases where the ID format is invalid for MongoDB
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
        return res.status(404).json({ msg: 'Maze not found with this ID.' });
    }
    res.status(500).json({ error: 'Server error while fetching maze.' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
