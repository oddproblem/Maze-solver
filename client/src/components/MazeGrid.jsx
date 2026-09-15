// client/src/components/MazeGrid.jsx
import React, { useMemo, forwardRef } from 'react';

const MazeGrid = forwardRef(function MazeGrid({
  grid,
  gridSize,
  onMouseDownNode,
  onMouseEnterNode,
  onMouseUpNode,
  onContextMenuNode,
  raceMode = false,
  gridId = 'main'
}, ref) {

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
    aspectRatio: '1 / 1',
  }), [gridSize]);

  return (
    <div
      style={gridStyle}
      className="w-full max-w-[min(80vw,70vh)] bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden select-none"
      onMouseLeave={onMouseUpNode}
    >
      {grid.map((row, rIdx) =>
        row.map((node, cIdx) => {
          const { isStart, isEnd, isWall, isVisited, isPath } = node;
          const elementId = `node-${gridId}-${rIdx}-${cIdx}`;

          let cellColor = 'bg-zinc-900';

          if (isStart) {
            cellColor = 'bg-emerald-500';
          } else if (isEnd) {
            cellColor = 'bg-red-500';
          } else if (isPath) {
            cellColor = 'node-path-anim';
          } else if (isVisited) {
            cellColor = raceMode && gridId === 'race2' ? 'node-visited-race-anim' : 'node-visited-anim';
          } else if (isWall) {
            cellColor = 'bg-zinc-600';
          }

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              id={elementId}
              data-row={rIdx}
              data-col={cIdx}
              className={`w-full h-full cursor-pointer transition-colors duration-100 flex items-center justify-center border-[0.5px] border-zinc-800/80 ${cellColor}`}
              onMouseDown={(e) => onMouseDownNode && onMouseDownNode(e, rIdx, cIdx)}
              onMouseEnter={() => onMouseEnterNode && onMouseEnterNode(rIdx, cIdx)}
              onMouseUp={onMouseUpNode}
              onContextMenu={(e) => onContextMenuNode && onContextMenuNode(e, rIdx, cIdx)}
            >
              {isStart && (
                <svg className="w-3/4 h-3/4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
              {isEnd && (
                <svg className="w-3/4 h-3/4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v18m0-18l14 7-14 7" />
                </svg>
              )}
            </div>
          );
        })
      )}
    </div>
  );
});

export default MazeGrid;
