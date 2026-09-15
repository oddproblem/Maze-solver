// client/src/components/HelpModal.jsx
import React from 'react';
import { ALGORITHMS } from '../algorithms/pathfinding';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">How to Use & Algorithm Guide</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-6 text-sm">
          {/* Controls Guide */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5">Grid Controls</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-lg">🖱️</span>
                <span><strong>Left Click + Drag:</strong> Draw walls</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-lg">🎯</span>
                <span><strong>Right Click:</strong> Move Start & Target nodes</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <span><strong>Spacebar:</strong> Solve or Pause/Resume</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-lg">🏁</span>
                <span><strong>Race Mode:</strong> 1v1 side-by-side battle</span>
              </div>
            </div>
          </div>

          {/* Algorithm Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">Pathfinding Algorithms</h4>
            <div className="space-y-2">
              {ALGORITHMS.map(a => (
                <div key={a.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{a.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      a.guaranteed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {a.guaranteed ? 'Guaranteed Shortest' : 'Heuristic Approximate'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
}
