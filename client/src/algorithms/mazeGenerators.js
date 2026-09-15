// client/src/algorithms/mazeGenerators.js

// 1. Recursive Backtracking Maze Generator (Perfect Maze)
export function generateRecursiveBacktracker(numRows, numCols, startNode, endNode) {
  // Walls initially on all cells
  const walls = [];
  const visited = Array.from({ length: numRows }, () => Array(numCols).fill(false));
  const isPassage = Array.from({ length: numRows }, () => Array(numCols).fill(false));

  // We operate on odd coordinates for passages and carve walls between them
  const startRow = startNode.row % 2 === 1 ? startNode.row : Math.max(1, startNode.row - 1);
  const startCol = startNode.col % 2 === 1 ? startNode.col : Math.max(1, startNode.col - 1);

  const stack = [[startRow, startCol]];
  visited[startRow][startCol] = true;
  isPassage[startRow][startCol] = true;

  const directions = [
    [-2, 0], // Up
    [2, 0],  // Down
    [0, -2], // Left
    [0, 2],  // Right
  ];

  while (stack.length > 0) {
    const [currRow, currCol] = stack[stack.length - 1];
    const neighbors = [];

    for (const [dr, dc] of directions) {
      const nr = currRow + dr;
      const nc = currCol + dc;
      if (nr > 0 && nr < numRows - 1 && nc > 0 && nc < numCols - 1 && !visited[nr][nc]) {
        neighbors.push([nr, nc, currRow + dr / 2, currCol + dc / 2]);
      }
    }

    if (neighbors.length > 0) {
      // Pick random neighbor
      const [nextR, nextC, wallR, wallC] = neighbors[Math.floor(Math.random() * neighbors.length)];
      visited[nextR][nextC] = true;
      isPassage[nextR][nextC] = true;
      isPassage[wallR][wallC] = true;
      stack.push([nextR, nextC]);
    } else {
      stack.pop();
    }
  }

  // Ensure start and end nodes are clear passages with neighbors
  isPassage[startNode.row][startNode.col] = true;
  isPassage[endNode.row][endNode.col] = true;
  
  // Clear adjacent cells to start and end so they connect into the maze
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const sr = startNode.row + dr, sc = startNode.col + dc;
    if (sr >= 0 && sr < numRows && sc >= 0 && sc < numCols) isPassage[sr][sc] = true;
    const er = endNode.row + dr, ec = endNode.col + dc;
    if (er >= 0 && er < numRows && ec >= 0 && ec < numCols) isPassage[er][ec] = true;
  }

  // Any cell that is NOT a passage is a wall
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (!isPassage[r][c] && !(r === startNode.row && c === startNode.col) && !(r === endNode.row && c === endNode.col)) {
        walls.push([r, c]);
      }
    }
  }

  return walls;
}

// 2. Recursive Division Maze Generator
export function generateRecursiveDivision(numRows, numCols, startNode, endNode) {
  const walls = [];

  // Outer border
  for (let r = 0; r < numRows; r++) {
    walls.push([r, 0]);
    walls.push([r, numCols - 1]);
  }
  for (let c = 0; c < numCols; c++) {
    walls.push([0, c]);
    walls.push([numRows - 1, c]);
  }

  function divide(r1, r2, c1, c2) {
    if (r2 - r1 < 3 || c2 - c1 < 3) return;

    const isHorizontal = r2 - r1 > c2 - c1 ? true : c2 - c1 > r2 - r1 ? false : Math.random() < 0.5;

    if (isHorizontal) {
      // Pick random even wall row
      const wallRow = Math.floor((r1 + 2 + Math.floor(Math.random() * (r2 - r1 - 3))) / 2) * 2;
      const passageCol = c1 + Math.floor(Math.random() * (c2 - c1 + 1));

      for (let c = c1; c <= c2; c++) {
        if (c !== passageCol && !(wallRow === startNode.row && c === startNode.col) && !(wallRow === endNode.row && c === endNode.col)) {
          walls.push([wallRow, c]);
        }
      }

      divide(r1, wallRow - 1, c1, c2);
      divide(wallRow + 1, r2, c1, c2);
    } else {
      // Pick random even wall col
      const wallCol = Math.floor((c1 + 2 + Math.floor(Math.random() * (c2 - c1 - 3))) / 2) * 2;
      const passageRow = r1 + Math.floor(Math.random() * (r2 - r1 + 1));

      for (let r = r1; r <= r2; r++) {
        if (r !== passageRow && !(r === startNode.row && wallCol === startNode.col) && !(r === endNode.row && wallCol === endNode.col)) {
          walls.push([r, wallCol]);
        }
      }

      divide(r1, r2, c1, wallCol - 1);
      divide(r1, r2, wallCol + 1, c2);
    }
  }

  divide(1, numRows - 2, 1, numCols - 2);

  // Filter out start & end nodes
  return walls.filter(([r, c]) => !(r === startNode.row && c === startNode.col) && !(r === endNode.row && c === endNode.col));
}

// 3. Spiral & Staircase Adversarial Pattern
export function generateSpiralPattern(numRows, numCols, startNode, endNode) {
  const walls = [];
  let top = 1, bottom = numRows - 2, left = 1, right = numCols - 2;

  while (top < bottom - 1 && left < right - 1) {
    for (let c = left; c <= right; c++) walls.push([top, c]);
    for (let r = top; r <= bottom; r++) walls.push([r, right]);
    for (let c = right; c >= left; c--) walls.push([bottom, c]);
    for (let r = bottom; r >= top + 2; r--) walls.push([r, left]);

    // Cut a passage
    walls.pop();
    top += 2;
    bottom -= 2;
    left += 2;
    right -= 2;
  }

  return walls.filter(([r, c]) => !(r === startNode.row && c === startNode.col) && !(r === endNode.row && c === endNode.col));
}

// 4. Random Wall Scatter
export function generateRandomWalls(numRows, numCols, startNode, endNode, density = 0.28) {
  const walls = [];
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if ((r === startNode.row && c === startNode.col) || (r === endNode.row && c === endNode.col)) continue;
      if (Math.random() < density) {
        walls.push([r, c]);
      }
    }
  }
  return walls;
}

export const MAZE_GENERATORS = [
  { id: 'Backtracker', name: 'Recursive Backtracker', desc: 'Carves winding labyrinths with guaranteed connectivity.' },
  { id: 'Division', name: 'Recursive Division', desc: 'Recursively divides chambers with doorways.' },
  { id: 'Spiral', name: 'Spiral Citadel', desc: 'Adversarial spiral testing heuristic detour resistance.' },
  { id: 'Random', name: 'Random Scatter', desc: 'Random obstacle density scattering.' },
];
