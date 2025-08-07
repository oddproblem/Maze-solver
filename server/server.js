// server/server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maze-solver';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema & Model ---
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

// POST /api/mazes - Save a new maze
app.post('/api/mazes', async (req, res) => {
  try {
    const { gridSize, startNode, endNode, walls } = req.body;

    if (
      typeof gridSize !== 'number' ||
      !startNode || typeof startNode.row !== 'number' || typeof startNode.col !== 'number' ||
      !endNode || typeof endNode.row !== 'number' || typeof endNode.col !== 'number' ||
      !Array.isArray(walls)
    ) {
      return res.status(400).json({ msg: 'Invalid maze data.' });
    }

    const newMaze = new Maze({ gridSize, startNode, endNode, walls });
    const savedMaze = await newMaze.save();
    res.status(201).json(savedMaze);

  } catch (err) {
    console.error('Error saving maze:', err);
    res.status(500).json({ error: 'Server error while saving maze.' });
  }
});

// GET /api/mazes/:id - Retrieve a maze by ID
app.get('/api/mazes/:id', async (req, res) => {
  try {
    const maze = await Maze.findById(req.params.id);
    if (!maze) {
      return res.status(404).json({ msg: 'Maze not found with this ID.' });
    }
    res.json(maze);
  } catch (err) {
    console.error('Error fetching maze:', err);
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: 'Invalid maze ID format.' });
    }
    res.status(500).json({ error: 'Server error while fetching maze.' });
  }
});

// --- Fallback Route (Regex version) ---
// This serves index.html for all non-API routes
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
