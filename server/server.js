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
  title: {
    type: String,
    default: 'Untitled Maze',
  },
  difficulty: {
    type: String,
    default: 'Medium',
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

// Preset initial mazes seeder
async function seedDefaultMazes() {
  try {
    const count = await Maze.countDocuments();
    if (count === 0) {
      const presets = [
        {
          _id: 'spiral-citadel',
          title: 'Spiral Citadel',
          difficulty: 'Hard',
          gridSize: 25,
          startNode: { row: 2, col: 2 },
          endNode: { row: 12, col: 12 },
          walls: generateSpiralWalls(25)
        },
        {
          _id: 'chamber-divide',
          title: 'Chamber Divide',
          difficulty: 'Medium',
          gridSize: 25,
          startNode: { row: 1, col: 1 },
          endNode: { row: 23, col: 23 },
          walls: generateChambers(25)
        }
      ];
      await Maze.insertMany(presets);
      console.log('Default presets seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding presets:', err);
  }
}

function generateSpiralWalls(size) {
  const walls = [];
  let top = 1, bottom = size - 2, left = 1, right = size - 2;
  while (top < bottom - 2 && left < right - 2) {
    for (let c = left; c <= right; c++) walls.push([top, c]);
    for (let r = top; r <= bottom; r++) walls.push([r, right]);
    for (let c = right; c >= left; c--) walls.push([bottom, c]);
    for (let r = bottom; r >= top + 2; r--) walls.push([r, left]);
    // Leave passage
    walls.pop();
    top += 2; bottom -= 2; left += 2; right -= 2;
  }
  return walls;
}

function generateChambers(size) {
  const walls = [];
  const mid = Math.floor(size / 2);
  for (let r = 0; r < size; r++) {
    if (r !== 5 && r !== 19) walls.push([r, mid]);
  }
  for (let c = 0; c < size; c++) {
    if (c !== 6 && c !== 18) walls.push([mid, c]);
  }
  return walls;
}

// Call seeder after connection
mongoose.connection.once('open', seedDefaultMazes);

// --- API Routes ---

// GET /api/mazes - Retrieve all saved mazes (latest first)
app.get('/api/mazes', async (req, res) => {
  try {
    const mazes = await Maze.find().sort({ createdAt: -1 }).limit(50);
    res.json(mazes);
  } catch (err) {
    console.error('Error fetching mazes:', err);
    res.status(500).json({ error: 'Server error while fetching mazes.' });
  }
});

// POST /api/mazes - Save a new maze
app.post('/api/mazes', async (req, res) => {
  try {
    const { title, difficulty, gridSize, startNode, endNode, walls } = req.body;

    if (
      typeof gridSize !== 'number' ||
      !startNode || typeof startNode.row !== 'number' || typeof startNode.col !== 'number' ||
      !endNode || typeof endNode.row !== 'number' || typeof endNode.col !== 'number' ||
      !Array.isArray(walls)
    ) {
      return res.status(400).json({ msg: 'Invalid maze data.' });
    }

    const newMaze = new Maze({
      title: title && title.trim() ? title.trim() : 'Custom Maze',
      difficulty: difficulty || 'Medium',
      gridSize,
      startNode,
      endNode,
      walls
    });
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
