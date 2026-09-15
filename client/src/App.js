// client/src/App.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './index.css';

import Header from './components/Header';
import MazeGrid from './components/MazeGrid';
import ControlPanel from './components/ControlPanel';
import RaceMode from './components/RaceMode';
import MazeLibraryModal from './components/MazeLibraryModal';
import SaveMazeModal from './components/SaveMazeModal';
import TutorialModal from './components/TutorialModal';

import {
  PathNode,
  bfs,
  dfs,
  dijkstra,
  aStar,
  greedyBestFirst
} from './algorithms/pathfinding';

import {
  generateRecursiveBacktracker,
  generateRecursiveDivision,
  generateSpiralPattern,
  generateRandomWalls
} from './algorithms/mazeGenerators';

export default function App() {
  const [currentMode, setCurrentMode] = useState('single');
  const [gridSize, setGridSize] = useState(25);
  const [grid, setGrid] = useState([]);
  const [startNodePos, setStartNodePos] = useState({ row: 2, col: 2 });
  const [endNodePos, setEndNodePos] = useState({ row: 22, col: 22 });
  const [isMousePressed, setIsMousePressed] = useState(false);

  // Algorithm & Solver State
  const [algorithm, setAlgorithm] = useState('AStar');
  const [mazeType, setMazeType] = useState('Backtracker');
  const [speed, setSpeed] = useState('fast');
  const [isSolving, setIsSolving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Stats Telemetry
  const [stepsTaken, setStepsTaken] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [solveTimeMs, setSolveTimeMs] = useState(0);

  // Modals & UI State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [libraryCount, setLibraryCount] = useState(0);
  const [notification, setNotification] = useState('');

  // Animation Refs
  const timeoutsRef = useRef([]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Check if first-time user and open tutorial popup automatically
  useEffect(() => {
    const hasSeen = localStorage.getItem('maze_tutorial_shown');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      localStorage.setItem('maze_tutorial_shown', 'true');
    }
  }, []);

  const createInitialGrid = useCallback((size, startPos, endPos) => {
    const newGrid = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const node = new PathNode(r, c);
        if (startPos && r === startPos.row && c === startPos.col) node.isStart = true;
        if (endPos && r === endPos.row && c === endPos.col) node.isEnd = true;
        row.push(node);
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  const fetchLibraryCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/mazes');
      setLibraryCount(res.data.length || 0);
    } catch (err) {
      console.warn('Could not fetch maze count:', err);
    }
  }, []);

  useEffect(() => {
    fetchLibraryCount();
  }, [fetchLibraryCount]);

  useEffect(() => {
    const validStart = {
      row: Math.min(startNodePos.row, gridSize - 2),
      col: Math.min(startNodePos.col, gridSize - 2),
    };
    const validEnd = {
      row: Math.min(endNodePos.row, gridSize - 2),
      col: Math.min(endNodePos.col, gridSize - 2),
    };
    setStartNodePos(validStart);
    setEndNodePos(validEnd);
    setGrid(createInitialGrid(gridSize, validStart, validEnd));
    clearAllTimeouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const clearSolution = useCallback(() => {
    clearAllTimeouts();
    setIsSolving(false);
    setIsPaused(false);
    setGrid(prev => prev.map(row => row.map(node => ({
      ...node,
      isVisited: false,
      isPath: false,
    }))));
    setStepsTaken(0);
    setPathLength(0);
    setSolveTimeMs(0);
  }, []);

  const clearAll = useCallback(() => {
    clearAllTimeouts();
    setIsSolving(false);
    setIsPaused(false);
    setGrid(createInitialGrid(gridSize, startNodePos, endNodePos));
    setStepsTaken(0);
    setPathLength(0);
    setSolveTimeMs(0);
  }, [createInitialGrid, gridSize, startNodePos, endNodePos]);

  const handleGenerateMaze = useCallback(() => {
    if (isSolving) return;
    clearSolution();

    let wallCoords = [];
    if (mazeType === 'Backtracker') {
      wallCoords = generateRecursiveBacktracker(gridSize, gridSize, startNodePos, endNodePos);
    } else if (mazeType === 'Division') {
      wallCoords = generateRecursiveDivision(gridSize, gridSize, startNodePos, endNodePos);
    } else if (mazeType === 'Spiral') {
      wallCoords = generateSpiralPattern(gridSize, gridSize, startNodePos, endNodePos);
    } else {
      wallCoords = generateRandomWalls(gridSize, gridSize, startNodePos, endNodePos, 0.28);
    }

    const wallMap = new Set(wallCoords.map(([r, c]) => `${r}-${c}`));
    const newGrid = createInitialGrid(gridSize, startNodePos, endNodePos);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (wallMap.has(`${r}-${c}`) && !newGrid[r][c].isStart && !newGrid[r][c].isEnd) {
          newGrid[r][c].isWall = true;
        }
      }
    }

    setGrid(newGrid);
    showNotification(`Generated ${mazeType} maze with ${wallCoords.length} walls.`);
  }, [isSolving, clearSolution, mazeType, gridSize, startNodePos, endNodePos, createInitialGrid]);

  const handleMouseDownNode = (e, row, col) => {
    if (isSolving || grid.length === 0) return;
    e.preventDefault();
    if (e.button === 0) {
      setIsMousePressed(true);
      toggleWall(row, col);
    }
  };

  const handleMouseEnterNode = (row, col) => {
    if (!isMousePressed || isSolving || grid.length === 0) return;
    toggleWall(row, col);
  };

  const handleMouseUpNode = () => {
    setIsMousePressed(false);
  };

  const toggleWall = (row, col) => {
    setGrid(prev => {
      const copy = prev.map(r => r.slice());
      const target = copy[row][col];
      if (!target.isStart && !target.isEnd) {
        copy[row][col] = { ...target, isWall: !target.isWall, isVisited: false, isPath: false };
      }
      return copy;
    });
  };

  const handleContextMenuNode = (e, row, col) => {
    e.preventDefault();
    if (isSolving) return;

    setGrid(prev => {
      const copy = prev.map(r => r.slice());
      const isCurrentlyStart = startNodePos.row === row && startNodePos.col === col;
      const isCurrentlyEnd = endNodePos.row === row && endNodePos.col === col;

      if (isCurrentlyStart || isCurrentlyEnd) return prev;

      copy[startNodePos.row][startNodePos.col].isStart = false;
      copy[row][col].isWall = false;
      copy[row][col].isStart = true;
      setStartNodePos({ row, col });

      return copy;
    });
  };

  const handleSolve = () => {
    if (isSolving || grid.length === 0) return;

    clearSolution();
    setIsSolving(true);
    setIsPaused(false);

    const gridCopy = grid.map(r => r.map(n => {
      const node = new PathNode(n.row, n.col);
      node.isWall = n.isWall;
      node.isStart = n.isStart;
      node.isEnd = n.isEnd;
      return node;
    }));

    const start = gridCopy[startNodePos.row][startNodePos.col];
    const end = gridCopy[endNodePos.row][endNodePos.col];

    let result = { visitedNodesInOrder: [], shortestPathNodes: [] };
    const startTime = performance.now();

    switch (algorithm) {
      case 'BFS': result = bfs(gridCopy, start, end); break;
      case 'DFS': result = dfs(gridCopy, start, end); break;
      case 'Dijkstra': result = dijkstra(gridCopy, start, end); break;
      case 'Greedy': result = greedyBestFirst(gridCopy, start, end); break;
      case 'AStar':
      default:
        result = aStar(gridCopy, start, end);
        break;
    }

    const execTime = Math.round(performance.now() - startTime);
    setSolveTimeMs(execTime || 1);

    const { visitedNodesInOrder, shortestPathNodes } = result;

    if (visitedNodesInOrder.length === 0) {
      showNotification('No valid path to target node.');
      setIsSolving(false);
      return;
    }

    if (speed === 'instant') {
      setGrid(prev => {
        const next = prev.map(r => r.slice());
        visitedNodesInOrder.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) {
            next[n.row][n.col].isVisited = true;
          }
        });
        shortestPathNodes.forEach(n => {
          if (!next[n.row][n.col].isStart && !next[n.row][n.col].isEnd) {
            next[n.row][n.col].isPath = true;
          }
        });
        return next;
      });
      setStepsTaken(visitedNodesInOrder.length);
      setPathLength(shortestPathNodes.length);
      setIsSolving(false);
      if (shortestPathNodes.length === 0) {
        showNotification('Target is trapped behind walls.');
      }
      return;
    }

    const delayMap = { slow: 35, normal: 15, fast: 6 };
    const stepDelay = delayMap[speed] || 15;

    visitedNodesInOrder.forEach((node, i) => {
      const t = setTimeout(() => {
        setGrid(prev => {
          const next = prev.map(r => r.slice());
          if (!next[node.row][node.col].isStart && !next[node.row][node.col].isEnd) {
            next[node.row][node.col] = { ...next[node.row][node.col], isVisited: true };
          }
          return next;
        });
        setStepsTaken(i + 1);

        if (i === visitedNodesInOrder.length - 1) {
          if (shortestPathNodes.length === 0) {
            setIsSolving(false);
            showNotification('No reachable path found.');
          } else {
            animatePath(shortestPathNodes);
          }
        }
      }, stepDelay * i);
      timeoutsRef.current.push(t);
    });
  };

  const animatePath = (pathNodes) => {
    pathNodes.forEach((node, i) => {
      const t = setTimeout(() => {
        setGrid(prev => {
          const next = prev.map(r => r.slice());
          if (!next[node.row][node.col].isStart && !next[node.row][node.col].isEnd) {
            next[node.row][node.col] = { ...next[node.row][node.col], isPath: true };
          }
          return next;
        });
        setPathLength(i + 1);

        if (i === pathNodes.length - 1) {
          setIsSolving(false);
          showNotification(`Target reached! Path: ${pathNodes.length} steps.`);
        }
      }, 35 * i);
      timeoutsRef.current.push(t);
    });
  };

  const handleTogglePlayPause = () => {
    if (!isSolving) return;
    if (!isPaused) {
      clearAllTimeouts();
      setIsPaused(true);
    } else {
      setIsPaused(false);
      handleSolve();
    }
  };

  const handleLoadSavedMaze = (savedData) => {
    clearSolution();
    const { gridSize: newSize, startNode, endNode, walls, title } = savedData;
    setGridSize(newSize);
    setStartNodePos(startNode);
    setEndNodePos(endNode);

    const newGrid = createInitialGrid(newSize, startNode, endNode);
    const wallSet = new Set(walls.map(([r, c]) => `${r}-${c}`));

    for (let r = 0; r < newSize; r++) {
      for (let c = 0; c < newSize; c++) {
        if (wallSet.has(`${r}-${c}`) && !newGrid[r][c].isStart && !newGrid[r][c].isEnd) {
          newGrid[r][c].isWall = true;
        }
      }
    }

    setGrid(newGrid);
    showNotification(`Loaded "${title || 'Saved Maze'}".`);
  };

  // Keyboard shortcut listeners
  const handlersRef = useRef({});
  handlersRef.current = { handleSolve, handleTogglePlayPause, clearSolution, handleGenerateMaze, isSolving };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      const { handleSolve: solve, handleTogglePlayPause: toggle, clearSolution: clear, handleGenerateMaze: gen, isSolving: solving } = handlersRef.current;
      if (e.code === 'Space') {
        e.preventDefault();
        if (solving) toggle();
        else solve();
      } else if (e.key === 'c' || e.key === 'C') {
        clear();
      } else if (e.key === 'r' || e.key === 'R') {
        gen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col font-sans">
      {/* Navbar Header */}
      <Header
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        libraryCount={libraryCount}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-zinc-800 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-6 w-full max-w-6xl mx-auto">
        {currentMode === 'race' ? (
          <RaceMode
            baseGrid={grid}
            gridSize={gridSize}
            startNodePos={startNodePos}
            endNodePos={endNodePos}
            onUpdateBaseGrid={setGrid}
          />
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Control Column */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <ControlPanel
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                mazeType={mazeType}
                setMazeType={setMazeType}
                speed={speed}
                setSpeed={setSpeed}
                gridSize={gridSize}
                setGridSize={setGridSize}
                isSolving={isSolving}
                isPaused={isPaused}
                onTogglePlayPause={handleTogglePlayPause}
                onSolve={handleSolve}
                onGenerateMaze={handleGenerateMaze}
                onClearSolution={clearSolution}
                onClearAll={clearAll}
                onOpenSaveModal={() => setIsSaveOpen(true)}
              />

              {/* Stats Panel */}
              <div className="bg-zinc-800/90 border border-zinc-700 p-4 rounded-xl shadow-lg space-y-2.5">
                <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Performance Stats
                  </h4>
                  <span className={`w-2 h-2 rounded-full ${isSolving ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                    <span className="text-[10px] text-zinc-400 block">Explored</span>
                    <span className="text-sm font-bold text-blue-400">{stepsTaken}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                    <span className="text-[10px] text-zinc-400 block">Path Length</span>
                    <span className="text-sm font-bold text-yellow-400">{pathLength}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                    <span className="text-[10px] text-zinc-400 block">Time</span>
                    <span className="text-sm font-bold text-zinc-200">{solveTimeMs}ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Grid Column */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3">
              {/* Clean Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                  <span>Start</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                  <span>Target</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-zinc-600"></span>
                  <span>Wall</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                  <span>Visited</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-yellow-400"></span>
                  <span>Shortest Path</span>
                </div>
              </div>

              {/* Grid Canvas */}
              <MazeGrid
                grid={grid}
                gridSize={gridSize}
                onMouseDownNode={handleMouseDownNode}
                onMouseEnterNode={handleMouseEnterNode}
                onMouseUpNode={handleMouseUpNode}
                onContextMenuNode={handleContextMenuNode}
              />

              <p className="text-[11px] text-zinc-400 text-center">
                Draw walls with left-click drag. Right-click to move Start or Target points.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <MazeLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onLoadMaze={handleLoadSavedMaze}
      />

      <SaveMazeModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        grid={grid}
        gridSize={gridSize}
        startNodePos={startNodePos}
        endNodePos={endNodePos}
        onSavedSuccess={(savedMaze) => {
          showNotification(`Saved "${savedMaze.title}".`);
          fetchLibraryCount();
        }}
      />
    </div>
  );
}
