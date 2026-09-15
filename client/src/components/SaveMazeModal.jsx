// client/src/components/SaveMazeModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function SaveMazeModal({
  isOpen,
  onClose,
  grid,
  gridSize,
  startNodePos,
  endNodePos,
  onSavedSuccess
}) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const walls = [];
      grid.forEach(row => {
        row.forEach(n => {
          if (n.isWall) walls.push([n.row, n.col]);
        });
      });

      const payload = {
        title: title.trim(),
        difficulty,
        gridSize,
        startNode: startNodePos,
        endNode: endNodePos,
        walls
      };

      const res = await axios.post('/api/mazes', payload);
      onSavedSuccess(res.data);
      onClose();
      setTitle('');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save maze to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-md p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-700">
          <h3 className="text-base font-bold text-white">Save Maze to Library</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Maze Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Custom Labyrinth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Maze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
