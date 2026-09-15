// client/src/components/RaceMode.jsx
import React, { useState, useEffect, useCallback } from 'react';
import MazeGrid from './MazeGrid';
import { ALGORITHMS, bfs, dfs, dijkstra, aStar, greedyBestFirst, PathNode } from '../algorithms/pathfinding';
import { MAZE_GENERATORS, generateRecursiveBacktracker, generateRecursiveDivision, generateSpiralPattern, generateRandomWalls } from '../algorithms/mazeGenerators';

export default function RaceMode({
  baseGrid,
  gridSize,
  startNodePos,
  endNodePos,
  onUpdateBaseGrid
}) {
  const [algo1, setAlgo1] = useState('AStar');
  const [algo2, setAlgo2] = useState('BFS');
  const [isRacing, setIsRacing] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [stats1, setStats1] = useState({ visited: 0, pathLength: 0, timeMs: 0, finished: false });
  const [stats2, setStats2] = useState({ visited: 0, pathLength: 0, timeMs: 0, finished: false });

  const [grid1, setGrid1] = useState([]);
  const [grid2, setGrid2] = useState([]);
  const [raceSpeed, setRaceSpeed] = useState('fast');

  const syncGrids = useCallback((sourceGrid = baseGrid) => {
    if (!sourceGrid || sourceGrid.length === 0) return;
    const g1 = sourceGrid.map(row => row.map(n => ({ ...n, isVisited: false, isPath: false })));
    const g2 = sourceGrid.map(row => row.map(n => ({ ...n, isVisited: false, isPath: false })));
    setGrid1(g1);
    setGrid2(g2);
    setRaceFinished(false);
    setWinner(null);
    setStats1({ visited: 0, pathLength: 0, timeMs: 0, finished: false });
    setStats2({ visited: 0, pathLength: 0, timeMs: 0, finished: false });
  }, [baseGrid]);

  useEffect(() => {
    syncGrids(baseGrid);
  }, [baseGrid, gridSize, syncGrids]);

  const runAlgorithm = (algoId, currentGrid) => {
    const gridCopy = currentGrid.map(row => row.map(n => {
      const node = new PathNode(n.row, n.col);
      node.isWall = n.isWall;
      node.isStart = n.isStart;
      node.isEnd = n.isEnd;
      return node;
    }));

    const start = gridCopy[startNodePos.row][startNodePos.col];
    const end = gridCopy[endNodePos.row][endNodePos.col];

    switch (algoId) {
      case 'BFS': return bfs(gridCopy, start, end);
      case 'DFS': return dfs(gridCopy, start, end);
      case 'Dijkstra': return dijkstra(gridCopy, start, end);
      case 'Greedy': return greedyBestFirst(gridCopy, start, end);
      case 'AStar':
      default:
        return aStar(gridCopy, start, end);
    }
  };

  const handleStartRace = () => {
    if (isRacing || grid1.length === 0) return;

    syncGrids(baseGrid);
    setIsRacing(true);
    setRaceFinished(false);
    setWinner(null);

    const res1 = runAlgorithm(algo1, baseGrid);
    const res2 = runAlgorithm(algo2, baseGrid);

    const delayMap = { slow: 25, normal: 12, fast: 4, instant: 0 };
    const stepDelay = delayMap[raceSpeed];

    const startTime = performance.now();
    let anim1Done = false;
    let anim2Done = false;

    if (stepDelay === 0) {
      const t1 = performance.now() - startTime;
      const t2 = performance.now() - startTime;

      setGrid1(prev => {
        const next = prev.map(r => r.slice());
        res1.visitedNodesInOrder.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) next[n.row][n.col].isVisited = true;
        });
        res1.shortestPathNodes.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) next[n.row][n.col].isPath = true;
        });
        return next;
      });

      setGrid2(prev => {
        const next = prev.map(r => r.slice());
        res2.visitedNodesInOrder.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) next[n.row][n.col].isVisited = true;
        });
        res2.shortestPathNodes.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) next[n.row][n.col].isPath = true;
        });
        return next;
      });

      setStats1({ visited: res1.visitedNodesInOrder.length, pathLength: res1.shortestPathNodes.length, timeMs: Math.round(t1) || 1, finished: true });
      setStats2({ visited: res2.visitedNodesInOrder.length, pathLength: res2.shortestPathNodes.length, timeMs: Math.round(t2) || 1, finished: true });
      setIsRacing(false);
      setRaceFinished(true);

      if (res1.visitedNodesInOrder.length < res2.visitedNodesInOrder.length) setWinner(algo1);
      else if (res2.visitedNodesInOrder.length < res1.visitedNodesInOrder.length) setWinner(algo2);
      else setWinner('Tie');
      return;
    }

    const totalSteps1 = res1.visitedNodesInOrder.length;
    res1.visitedNodesInOrder.forEach((node, i) => {
      setTimeout(() => {
        setGrid1(prev => {
          const next = prev.map(r => r.slice());
          if (!next[node.row][node.col].isStart && !next[node.row][node.col].isEnd) {
            next[node.row][node.col] = { ...next[node.row][node.col], isVisited: true };
          }
          return next;
        });
        setStats1(s => ({ ...s, visited: i + 1 }));

        if (i === totalSteps1 - 1) {
          res1.shortestPathNodes.forEach((pNode, pi) => {
            setTimeout(() => {
              setGrid1(prev => {
                const next = prev.map(r => r.slice());
                if (!next[pNode.row][pNode.col].isStart && !next[pNode.row][pNode.col].isEnd) {
                  next[pNode.row][pNode.col] = { ...next[pNode.row][pNode.col], isPath: true };
                }
                return next;
              });
              if (pi === res1.shortestPathNodes.length - 1) {
                anim1Done = true;
                const finishTime1 = Math.round(performance.now() - startTime);
                setStats1(s => ({ ...s, pathLength: res1.shortestPathNodes.length, timeMs: finishTime1, finished: true }));
                checkRaceEnd();
              }
            }, 30 * pi);
          });
        }
      }, stepDelay * i);
    });

    const totalSteps2 = res2.visitedNodesInOrder.length;
    res2.visitedNodesInOrder.forEach((node, i) => {
      setTimeout(() => {
        setGrid2(prev => {
          const next = prev.map(r => r.slice());
          if (!next[node.row][node.col].isStart && !next[node.row][node.col].isEnd) {
            next[node.row][node.col] = { ...next[node.row][node.col], isVisited: true };
          }
          return next;
        });
        setStats2(s => ({ ...s, visited: i + 1 }));

        if (i === totalSteps2 - 1) {
          res2.shortestPathNodes.forEach((pNode, pi) => {
            setTimeout(() => {
              setGrid2(prev => {
                const next = prev.map(r => r.slice());
                if (!next[pNode.row][pNode.col].isStart && !next[pNode.row][pNode.col].isEnd) {
                  next[pNode.row][pNode.col] = { ...next[pNode.row][pNode.col], isPath: true };
                }
                return next;
              });
              if (pi === res2.shortestPathNodes.length - 1) {
                anim2Done = true;
                const finishTime2 = Math.round(performance.now() - startTime);
                setStats2(s => ({ ...s, pathLength: res2.shortestPathNodes.length, timeMs: finishTime2, finished: true }));
                checkRaceEnd();
              }
            }, 30 * pi);
          });
        }
      }, stepDelay * i);
    });

    function checkRaceEnd() {
      if (anim1Done && anim2Done) {
        setIsRacing(false);
        setRaceFinished(true);
        if (res1.visitedNodesInOrder.length < res2.visitedNodesInOrder.length) setWinner(algo1);
        else if (res2.visitedNodesInOrder.length < res1.visitedNodesInOrder.length) setWinner(algo2);
        else setWinner('Tie');
      }
    }
  };

  const handleGenerateRaceMaze = (type) => {
    if (isRacing) return;
    let walls = [];
    if (type === 'Backtracker') walls = generateRecursiveBacktracker(gridSize, gridSize, startNodePos, endNodePos);
    else if (type === 'Division') walls = generateRecursiveDivision(gridSize, gridSize, startNodePos, endNodePos);
    else if (type === 'Spiral') walls = generateSpiralPattern(gridSize, gridSize, startNodePos, endNodePos);
    else walls = generateRandomWalls(gridSize, gridSize, startNodePos, endNodePos, 0.3);

    const wallSet = new Set(walls.map(([r, c]) => `${r}-${c}`));
    const newBase = baseGrid.map(row => row.map(n => ({
      ...n,
      isWall: wallSet.has(`${n.row}-${n.col}`),
      isVisited: false,
      isPath: false
    })));

    onUpdateBaseGrid(newBase);
    syncGrids(newBase);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-5 max-w-6xl mx-auto px-4 pb-8">
      {/* Top Controls Bar */}
      <div className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Side-by-Side Algorithm Comparison</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Evaluate two algorithms simultaneously on the identical maze.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            onChange={(e) => handleGenerateRaceMaze(e.target.value)}
            disabled={isRacing}
            defaultValue=""
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>Generate Maze...</option>
            {MAZE_GENERATORS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-700">
            {['normal', 'fast', 'instant'].map(s => (
              <button
                key={s}
                onClick={() => setRaceSpeed(s)}
                className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition ${
                  raceSpeed === s ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartRace}
            disabled={isRacing}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isRacing ? 'Running...' : 'Start Comparison'}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {raceFinished && (
        <div className="w-full p-3.5 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block">Result</span>
            <h3 className="text-sm font-bold text-white">
              {winner === 'Tie' ? 'Tie: Both explored the same number of nodes.' : `${ALGORITHMS.find(a => a.id === winner)?.name} visited fewer nodes.`}
            </h3>
          </div>
          <div className="flex items-center space-x-6 text-xs text-zinc-300">
            <div>
              <span className="text-[10px] text-zinc-400 block">Node Difference</span>
              <span className="font-bold text-emerald-400">{Math.abs(stats1.visited - stats2.visited)} nodes</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Path Length</span>
              <span className="font-bold text-zinc-200">
                {stats1.pathLength === stats2.pathLength ? `${stats1.pathLength} steps (Identical)` : `Diff: ${Math.abs(stats1.pathLength - stats2.pathLength)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dual Boards */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Board 1 */}
        <div className="flex flex-col items-center bg-zinc-800 border border-zinc-700 p-4 rounded-xl">
          <div className="w-full flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-zinc-300">Algorithm 1</span>
            <select
              value={algo1}
              onChange={(e) => setAlgo1(e.target.value)}
              disabled={isRacing}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:ring-1 focus:ring-emerald-500"
            >
              {ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg p-2 mb-3 text-center text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block">Visited</span>
              <span className="font-bold text-blue-400">{stats1.visited}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Path Length</span>
              <span className="font-bold text-yellow-400">{stats1.pathLength || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Time</span>
              <span className="font-bold text-zinc-200">{stats1.timeMs ? `${stats1.timeMs}ms` : '—'}</span>
            </div>
          </div>

          <MazeGrid
            grid={grid1}
            gridSize={gridSize}
            isSolving={isRacing}
            raceMode={true}
            gridId="race1"
          />
        </div>

        {/* Board 2 */}
        <div className="flex flex-col items-center bg-zinc-800 border border-zinc-700 p-4 rounded-xl">
          <div className="w-full flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-zinc-300">Algorithm 2</span>
            <select
              value={algo2}
              onChange={(e) => setAlgo2(e.target.value)}
              disabled={isRacing}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:ring-1 focus:ring-emerald-500"
            >
              {ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-700/80 rounded-lg p-2 mb-3 text-center text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block">Visited</span>
              <span className="font-bold text-purple-400">{stats2.visited}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Path Length</span>
              <span className="font-bold text-yellow-400">{stats2.pathLength || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Time</span>
              <span className="font-bold text-zinc-200">{stats2.timeMs ? `${stats2.timeMs}ms` : '—'}</span>
            </div>
          </div>

          <MazeGrid
            grid={grid2}
            gridSize={gridSize}
            isSolving={isRacing}
            raceMode={true}
            gridId="race2"
          />
        </div>
      </div>
    </div>
  );
}
