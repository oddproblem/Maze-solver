// client/src/components/ControlPanel.jsx
import React from 'react';
import { ALGORITHMS } from '../algorithms/pathfinding';
import { MAZE_GENERATORS } from '../algorithms/mazeGenerators';

export default function ControlPanel({
  algorithm,
  setAlgorithm,
  mazeType,
  setMazeType,
  speed,
  setSpeed,
  gridSize,
  setGridSize,
  isSolving,
  isPaused,
  onTogglePlayPause,
  onSolve,
  onGenerateMaze,
  onClearSolution,
  onClearAll,
  onOpenSaveModal,
}) {
  const currentAlgo = ALGORITHMS.find(a => a.id === algorithm) || ALGORITHMS[0];

  return (
    <div className="flex flex-col space-y-4 bg-zinc-800/90 border border-zinc-700 p-4 rounded-xl shadow-lg w-full">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-zinc-700 pb-2.5">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center space-x-2">
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Maze Controls</span>
        </h3>
        <span className="text-[11px] text-zinc-400">Controls</span>
      </div>

      {/* Primary Action Button */}
      <div className="space-y-2">
        <button
          onClick={isSolving ? onTogglePlayPause : onSolve}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition flex items-center justify-center space-x-2 ${
            isSolving
              ? isPaused
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSolving ? (
            isPaused ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                <span>Resume</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 9v6m4-6v6" />
                </svg>
                <span>Pause</span>
              </>
            )
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              <span>Solve Maze</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onClearSolution}
            disabled={isSolving}
            className="py-1.5 px-3 text-xs font-medium rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition disabled:opacity-50"
          >
            Clear Path
          </button>
          <button
            onClick={onClearAll}
            disabled={isSolving}
            className="py-1.5 px-3 text-xs font-medium rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition disabled:opacity-50"
          >
            Clear Walls
          </button>
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-400">
          Algorithm
        </label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isSolving}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        >
          {ALGORITHMS.map(algo => (
            <option key={algo.id} value={algo.id}>
              {algo.name} {algo.guaranteed ? '(Shortest Path)' : '(Heuristic)'}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-zinc-400 px-0.5">
          {currentAlgo.desc}
        </p>
      </div>

      {/* Maze Generators */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-400">
          Generate Maze
        </label>
        <div className="flex space-x-2">
          <select
            value={mazeType}
            onChange={(e) => setMazeType(e.target.value)}
            disabled={isSolving}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          >
            {MAZE_GENERATORS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={onGenerateMaze}
            disabled={isSolving}
            className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600 rounded-lg text-xs font-semibold whitespace-nowrap transition disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Speed & Grid Size */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-400">Speed</span>
            <span className="text-emerald-400 font-bold capitalize">{speed}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['slow', 'normal', 'fast', 'instant'].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`py-1 text-[11px] font-medium rounded capitalize transition ${
                  speed === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                {s === 'instant' ? '0ms' : s.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-400">Grid</span>
            <span className="text-zinc-200 font-bold">{gridSize}×{gridSize}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[15, 25, 35].map(size => (
              <button
                key={size}
                disabled={isSolving}
                onClick={() => setGridSize(size)}
                className={`py-1 text-[11px] font-medium rounded transition disabled:opacity-50 ${
                  gridSize === size
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Maze Button */}
      <div className="pt-2 border-t border-zinc-700">
        <button
          onClick={onOpenSaveModal}
          disabled={isSolving}
          className="w-full py-2 px-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600 text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>Save Maze to Library</span>
        </button>
      </div>
    </div>
  );
}
