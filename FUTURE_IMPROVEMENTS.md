# Future Improvements — Maze Solver

Review date: Nov 2026. Goal: turn this project into something with measured, defensible numbers.

## Current state (what the code actually has)
- 5 pathfinding algorithms in `client/src/algorithms/pathfinding.js`: BFS, DFS, Dijkstra, A*, Greedy Best-First.
- 4 maze generators in `client/src/algorithms/mazeGenerators.js`: Recursive Backtracker, Recursive Division, Spiral, Random Walls (density 0.28).
- Race Mode (`client/src/components/RaceMode.jsx`) runs two algorithms side by side.
- Express + MongoDB API in `server/server.js`: `GET /api/mazes`, `POST /api/mazes`, `GET /api/mazes/:id`.
- Default grid 25x25 (`App.js`, `useState(25)`); solve time is measured with `performance.now()` in `App.js` but never recorded.
- Only test: `client/src/App.test.js` is the create-react-app placeholder looking for "learn react", which the app no longer renders, so it would fail.

## 1. Add measurable results (highest value for a resume)
1. **Algorithm benchmark script: DONE (Nov 2026).** `scripts/benchmark.mjs` (`npm run benchmark`) → `benchmarks/RESULTS.md`.
   - Headline: A* expands 77.0% fewer nodes than BFS on 51x51 random grids with a 100% optimal path rate; 0 shortest-path disagreements across 847 solvable mazes.
   - Problems the benchmark exposed, each a good follow-up with a before/after number:
     - **Dijkstra binary heap: DONE.** 33.9 → 0.38 ms on 51x51 random grids (89x), 181–208x on the other 51x51 maze types, same shortest paths. **A* on the heap: DONE** too: 5.1x faster on 51x51 random grids (0.397 → 0.078 ms), now faster than BFS there, with identical nodes expanded. Still open: `greedyBestFirst` re-sorts its open set on every pop and could use the same `MinHeap`.
     - **Recursive Division often generates unsolvable mazes**: only 89/200 at 25x25 and 12/200 at 51x51 were solvable. The doorway (`passageCol`/`passageRow`) can land on a cell that a later perpendicular wall covers. Pick doorways on odd indices and walls on even ones, then re-run the benchmark expecting 200/200.
     - **Spiral is not adversarial**: from the default start, every algorithm reaches the end after expanding 41 nodes (25x25), so it doesn't test heuristic detours the way its description says.
2. **Correctness tests** (Jest is already present through react-scripts): `pathfinding.test.js` asserting
   - BFS, Dijkstra and A* return equal path lengths on the same maze (optimality check),
   - an unreachable end returns an empty path,
   - generated mazes always keep start and end open.
   Report "[N] unit tests, [X]% line coverage" from `npm test -- --coverage`.
3. **Frontend performance**: run Lighthouse on the production build (`npm run build`, then serve it) and record Performance/Accessibility scores. Profile the animation of 100x100 grids in React DevTools and give the FPS before and after memoising `MazeGrid.jsx` cells.
4. **API load test**: k6 script hitting `GET /api/mazes/:id` with 50 VUs for 60s and report p95 latency and requests per second.

## 2. Production-readiness gaps
- Replace the broken placeholder test, then add a GitHub Actions workflow running lint, tests and the build.
- Add input validation on `POST /api/mazes` (grid dimensions, payload size limit through `express.json({ limit })`).
- Add a rate limiter on the save endpoint and an index on the share code field.
- Dockerfile plus docker-compose (app + mongo), then deploy (Render/Vercel + MongoDB Atlas) and put the live URL in the README.
- README still has the `your-username` placeholder clone URL; update it and add screenshots or a GIF.

## 3. Standout features for recruiters
- **Algorithm comparison dashboard**: chart nodes visited and time per algorithm after each Race Mode run (data already available).
- **Bidirectional BFS / Jump Point Search** with the benchmark table showing the speedup.

## 4. Resume bullet templates
- Built a full-stack maze visualizer (React, Express, MongoDB) with 5 pathfinding algorithms and 4 maze generators, plus a side-by-side race mode.
- Benchmarked 5 algorithms over [N] seeded mazes up to 100x100; A* expanded [X]% fewer nodes than BFS while matching optimal path length.
- Wrote [N] Jest tests reaching [X]% coverage of the algorithm module, run in CI on every push.
- Cut render time for 100x100 grids from [X] ms to [Y] ms by memoising grid cells.
