// client/src/components/Header.jsx
import React from 'react';

export default function Header({
  currentMode,
  setCurrentMode,
  onOpenLibrary,
  onOpenTutorial,
  libraryCount
}) {
  return (
    <header className="flex flex-wrap justify-between items-center px-6 py-3.5 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            Maze Solver
          </h1>
          <p className="text-[11px] text-zinc-400">Pathfinding Algorithm Visualizer</p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 my-2 sm:my-0">
        <button
          onClick={() => setCurrentMode('single')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            currentMode === 'single'
              ? 'bg-emerald-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Single Visualizer
        </button>
        <button
          onClick={() => setCurrentMode('race')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            currentMode === 'race'
              ? 'bg-emerald-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Compare Algorithms
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenTutorial}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Tutorial</span>
        </button>

        <button
          onClick={onOpenLibrary}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
        >
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Maze Library</span>
          {libraryCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-zinc-700 text-zinc-300">
              {libraryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
