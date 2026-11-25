Interactive Maze Solver
This is a full-stack web application that allows users to create, visualize, and solve mazes using popular pathfinding algorithms. It's designed to be an engaging and educational tool for understanding how algorithms like Breadth-First Search (BFS) and A* (A-Star) navigate through complex paths to find the most optimal solution.

The application features a React frontend for a dynamic user experience and an Express.js backend with MongoDB for saving and sharing maze layouts.

Features
Core Functionality
Interactive Grid: Click and drag to instantly draw or erase walls on the grid.

Start & End Nodes: Set custom start and end points for the maze with a simple right-click.

Algorithm Visualization: Watch in real-time as the chosen algorithm explores the maze (visited nodes) and then highlights the shortest path.

Algorithm Selection: Seamlessly switch between the BFS and A* algorithms to compare their performance.

Maze Controls: Easily generate a random maze based on difficulty or clear the grid to start fresh.

Gamification & User Experience
Difficulty Levels: Choose between Easy, Medium, and Hard to automatically adjust the density of walls in a random maze.

Performance Tracking: A live timer and step counter measure the efficiency of the solving process.

Save & Share: Save your custom maze layout to the database and get a unique code to share with others, allowing them to load your exact maze.

Responsive Design: A clean, modern UI that works smoothly on all screen sizes.

Tech Stack
This project is a monorepo containing both the frontend and backend code.

Frontend:

React: For building the interactive user interface.

Tailwind CSS: For modern, utility-first styling.

Axios: For making API requests to the backend.

Backend:

Node.js: As the JavaScript runtime environment.

Express.js: As the web server framework for building the API.

MongoDB: A NoSQL database used to store maze data.

Mongoose: As an Object Data Modeler (ODM) to interact with the MongoDB database.

CORS: To handle cross-origin requests between the frontend and backend during development.

Algorithms Explained
This application visualizes two fundamental pathfinding algorithms.

1. Breadth-First Search (BFS)
BFS is an algorithm that explores a graph or tree level by level. It's a "blind" search algorithm because it doesn't know the direction of the goal.

How it works:

It starts at the start node.

It explores all of the start node's direct neighbors.

Then, it explores all the neighbors of those neighbors, and so on.

It uses a queue (First-In, First-Out) to keep track of the next nodes to visit.

Guarantee: BFS is guaranteed to find the shortest path in terms of the number of steps, making it ideal for unweighted grids like our maze. Its main drawback is that it can be slow, as it explores in all directions equally.

2. A* (A-Star) Search
A* is a "smarter" and more efficient pathfinding algorithm. It's considered an "informed" search because it uses a heuristic to make an educated guess about the best path to take.

How it works:

Like BFS, it explores the grid, but it prioritizes nodes that seem to be closer to the end goal.

For each node, it calculates a value, f(n) = g(n) + h(n), where:

g(n) is the actual distance from the start node to the current node n.

h(n) is the heuristic, or estimated distance, from the current node n to the end node. (We use the "Manhattan distance" for this).

A* always chooses to explore the node with the lowest f(n) value first.

Guarantee: A* is also guaranteed to find the shortest path, but it does so much faster than BFS because it avoids exploring in directions that are clearly wrong.

Local Setup and Installation
To run this project on your local machine, follow these steps:

Prerequisites:

Node.js and npm installed.

MongoDB installed and running locally (e.g., via MongoDB Compass).

Clone the repository:

git clone https://github.com/your-username/maze-solver-app.git
cd maze-solver-app

Install Backend Dependencies:

cd server
npm install

Install Frontend Dependencies:

cd ../client
npm install

Run the Application:

In one terminal, start the backend server:

cd server
npm start

In a second terminal, start the React frontend:

cd ../client
npm start

The application should now be running at http://localhost:3000.

Deployment
This application is configured for a monorepo deployment on Render. The Express server is set up to handle API requests and serve the static React build files.

Platform: Render

Root Directory: / (root of the repository)

Build Command: npm install && npm run build --prefix server

Start Command: npm start --prefix server

For a successful deployment, a MONGO_URI environment variable pointing to a cloud-hosted MongoDB Atlas instance must be set in the Render dashboard.

Benchmark
A seeded, reproducible benchmark of all 5 algorithms across the 4 maze generators lives in `scripts/benchmark.mjs`:

npm run benchmark

It writes `benchmarks/results.json` and `benchmarks/RESULTS.md` (full tables). It exits non-zero if BFS, Dijkstra and A* ever disagree on shortest-path length. Last run: 0 disagreements across 847 solvable mazes. Headline numbers (200 seeded mazes per generator and size, Node 24, i5-13500H):

- A* expands 77.0% fewer nodes than BFS on 51x51 random-obstacle grids (418.7 vs 1824.2) and 74.8% fewer on 25x25, with a 100% optimal path rate.
- Greedy Best-First expands the fewest nodes (91.7% fewer than BFS at 51x51) but found the optimal path in 0% of those mazes, with paths 19.1% longer on average.
- On perfect mazes (Recursive Backtracker), A* saves only 8.7–14.4% over BFS: with a single route to the exit, the heuristic has little to prune.
- Dijkstra used to re-sort every cell on every step (33.9 ms median on 51x51 random grids, 90–350x slower than BFS). Replacing that with a binary-heap priority queue made it 89x faster there (33.9 → 0.38 ms) and 181–208x faster on the other 51x51 maze types, with identical shortest paths. It is now within 1.5–2.5x of BFS; the remaining gap is heap overhead. Before and after tables: `benchmarks/RESULTS_before_heap.md` and `benchmarks/RESULTS.md`.
- A* used to re-sort its open set on every pop, which made it about 2.5x slower than BFS even though it expanded 77% fewer nodes. On the same heap, it is 5.1x faster on 51x51 random grids (0.397 → 0.078 ms median, p95 2.0 → 0.30 ms) and now beats BFS outright there (0.078 vs 0.138 ms). It expands exactly the same nodes as before. On perfect mazes (Recursive Backtracker), A* is still about 1.5x slower than BFS: it prunes only 9–14% of nodes, so the heap overhead outweighs the savings.
