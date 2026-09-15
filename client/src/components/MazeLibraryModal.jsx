// client/src/components/MazeLibraryModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MazeLibraryModal({ isOpen, onClose, onLoadMaze }) {
  const [mazes, setMazes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  useEffect(() => {
    if (isOpen) {
      fetchMazes();
    }
  }, [isOpen]);

  const fetchMazes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/mazes');
      setMazes(res.data);
    } catch (err) {
      console.error('Failed to load mazes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredMazes = mazes.filter(m => {
    const matchesSearch = (m.title || 'Untitled').toLowerCase().includes(search.toLowerCase()) ||
                          m._id.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = filterDifficulty === 'All' || m.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div>
            <h3 className="text-base font-bold text-white">Maze Library</h3>
            <p className="text-xs text-zinc-400">Browse and load saved maze layouts</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-zinc-900 border-b border-zinc-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-grow max-w-sm bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search mazes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 outline-none w-full"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-zinc-400">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  filterDifficulty === d
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Maze Cards Grid */}
        <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-zinc-400 text-xs">
              Loading mazes...
            </div>
          ) : filteredMazes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-400 text-xs">
              No mazes found.
            </div>
          ) : (
            filteredMazes.map(m => (
              <div
                key={m._id}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {m.difficulty || 'Medium'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {m.gridSize}×{m.gridSize}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {m.title || 'Untitled Maze'}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-2 pt-2 border-t border-zinc-800">
                    <span>Walls: {m.walls?.length || 0}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{m._id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m._id);
                      alert(`Copied ID "${m._id}" to clipboard!`);
                    }}
                    className="py-1.5 px-2 text-xs font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => {
                      onLoadMaze(m);
                      onClose();
                    }}
                    className="py-1.5 px-2 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  >
                    Load Maze
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
