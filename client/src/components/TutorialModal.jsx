// client/src/components/TutorialModal.jsx
import React, { useState } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Maze Solver',
    subtitle: 'Learn how to build, test, and analyze pathfinding algorithms in under a minute.',
    content: (
      <div className="space-y-3 text-sm text-zinc-300">
        <p>
          This app lets you create custom mazes and visualize how different graph search algorithms explore paths to reach a target.
        </p>
        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 text-xs space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
            <span><strong>Green Node:</strong> Start position</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>
            <span><strong>Red Node:</strong> Target destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-zinc-600 inline-block"></span>
            <span><strong>Dark Gray:</strong> Wall obstacle</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
            <span><strong>Blue:</strong> Explored frontier</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block"></span>
            <span><strong>Yellow:</strong> Solved shortest path</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Drawing Walls & Moving Points',
    subtitle: 'Interacting directly with the maze grid.',
    content: (
      <div className="space-y-3 text-sm text-zinc-300">
        <div className="space-y-2">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
            <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-1">Left Click + Drag</h4>
            <p className="text-xs text-zinc-300">Click and drag over grid squares to draw or erase walls in real time.</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
            <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-1">Right Click</h4>
            <p className="text-xs text-zinc-300">Right click any empty square to move your Start (Green) and Target (Red) positions.</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
            <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider mb-1">Generate Mazes</h4>
            <p className="text-xs text-zinc-300">Use the maze dropdown to auto-generate mazes using Recursive Backtracking, Recursive Division, or Spiral patterns.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Pathfinding Algorithms',
    subtitle: 'Choosing the right solver for the job.',
    content: (
      <div className="space-y-2 text-xs text-zinc-300">
        <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-700">
          <span className="font-bold text-white">A* Search:</span>
          <p className="text-zinc-400 mt-0.5">Smartest and fastest. Uses distance heuristics to navigate straight toward the target while guaranteeing the shortest path.</p>
        </div>
        <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-700">
          <span className="font-bold text-white">Breadth-First Search (BFS):</span>
          <p className="text-zinc-400 mt-0.5">Explores evenly in concentric ripples. Guaranteed to find the shortest path, but visits more nodes.</p>
        </div>
        <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-700">
          <span className="font-bold text-white">Dijkstra's Algorithm:</span>
          <p className="text-zinc-400 mt-0.5">The baseline optimal routing algorithm. Evaluates lowest cumulative path distance.</p>
        </div>
        <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-700">
          <span className="font-bold text-white">Greedy & DFS:</span>
          <p className="text-zinc-400 mt-0.5">Fast exploratory algorithms that demonstrate non-optimal or deep winding routes.</p>
        </div>
      </div>
    )
  },
  {
    title: 'Speed, Playback & Shortcuts',
    subtitle: 'Fine-tune animation and use quick keys.',
    content: (
      <div className="space-y-3 text-sm text-zinc-300">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
            <span className="font-bold text-white block">Speed Options</span>
            <p className="text-zinc-400 mt-1">Slow, Normal, Fast, or Instant (0ms) for immediate results on large grids.</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
            <span className="font-bold text-white block">Pause / Resume</span>
            <p className="text-zinc-400 mt-1">Pause solving at any moment to inspect the explored frontier.</p>
          </div>
        </div>
        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 text-xs">
          <span className="font-bold text-white block mb-1.5">Keyboard Shortcuts:</span>
          <ul className="space-y-1 text-zinc-300">
            <li><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-[11px] font-mono">Space</kbd> : Solve or Pause/Resume</li>
            <li><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-[11px] font-mono">C</kbd> : Clear solved path</li>
            <li><kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-600 rounded text-[11px] font-mono">R</kbd> : Generate new maze</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: 'Side-by-Side Comparison & Library',
    subtitle: 'Race algorithms and save your favorite mazes.',
    content: (
      <div className="space-y-3 text-sm text-zinc-300">
        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 text-xs">
          <h4 className="font-bold text-emerald-400 mb-1">Side-by-Side Comparison Mode</h4>
          <p className="text-zinc-300">
            Click "Compare Algorithms" in the top bar to run two algorithms simultaneously on the identical maze and see which visits fewer nodes.
          </p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 text-xs">
          <h4 className="font-bold text-emerald-400 mb-1">Maze Library</h4>
          <p className="text-zinc-300">
            Click "Maze Library" to load presets like *Spiral Citadel* or *Chamber Divide*, or click "Save Maze" to save your layout to the database.
          </p>
        </div>
      </div>
    )
  }
];

export default function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-700 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-700 text-zinc-200">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              setCurrentStep(0);
            }}
            className="text-zinc-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">{step.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5 mb-4">{step.subtitle}</p>
          {step.content}
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center space-x-1.5 mb-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep ? 'bg-emerald-500 w-5' : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
          <button
            type="button"
            onClick={() => {
              onClose();
              setCurrentStep(0);
            }}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              {isLast ? 'Finish Tutorial' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
