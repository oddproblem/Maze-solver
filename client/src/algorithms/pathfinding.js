// client/src/algorithms/pathfinding.js

export class PathNode {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.isVisited = false;
    this.isPath = false;
    this.weight = 1;
    this.distance = Infinity;
    this.previousNode = null;
    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
  }
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  const numRows = grid.length;
  const numCols = grid[0].length;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < numCols - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(n => !n.isWall);
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}

// 1. Breadth-First Search (BFS) - Guaranteed Shortest Path (unweighted)
export function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPathNodes: reconstructPath(current)
      };
    }

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.distance = current.distance + 1;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

// 2. Depth-First Search (DFS) - Winding, Non-optimal path
export function dfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current.isVisited) continue;
    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPathNodes: reconstructPath(current)
      };
    }

    const neighbors = getNeighbors(current, grid);
    // Shuffle or natural order for interesting exploration
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = current;
        stack.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

// 3. Dijkstra's Algorithm - Classic weighted shortest path
export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const unvisitedNodes = [];

  for (const row of grid) {
    for (const node of row) {
      unvisitedNodes.push(node);
    }
  }

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) {
      return { visitedNodesInOrder, shortestPathNodes: [] };
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPathNodes: reconstructPath(closestNode)
      };
    }

    const neighbors = getNeighbors(closestNode, grid).filter(n => !n.isVisited);
    for (const neighbor of neighbors) {
      const alt = closestNode.distance + (neighbor.weight || 1);
      if (alt < neighbor.distance) {
        neighbor.distance = alt;
        neighbor.previousNode = closestNode;
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

// 4. A* Search (A-Star) - Heuristic Informed (f = g + h)
export function aStar(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const openSet = [startNode];
  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.h;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f || a.h - b.h);
    const current = openSet.shift();

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPathNodes: reconstructPath(current)
      };
    }

    const neighbors = getNeighbors(current, grid).filter(n => !n.isVisited);
    for (const neighbor of neighbors) {
      const tentativeG = current.g + (neighbor.weight || 1);
      if (tentativeG < neighbor.g) {
        neighbor.previousNode = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

// 5. Greedy Best-First Search - Prioritizes heuristic (f = h)
export function greedyBestFirst(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const openSet = [startNode];
  startNode.h = heuristic(startNode, endNode);
  startNode.isVisited = true;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift();
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return {
        visitedNodesInOrder,
        shortestPathNodes: reconstructPath(current)
      };
    }

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = current;
        neighbor.h = heuristic(neighbor, endNode);
        openSet.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

export const ALGORITHMS = [
  { id: 'AStar', name: 'A* Search', heuristic: true, guaranteed: true, desc: 'Uses distance from start + estimated heuristic to target. Fast & optimal.' },
  { id: 'BFS', name: 'Breadth-First Search', heuristic: false, guaranteed: true, desc: 'Explores level-by-level in ripples. Guaranteed shortest path.' },
  { id: 'Dijkstra', name: 'Dijkstra\'s Algorithm', heuristic: false, guaranteed: true, desc: 'Explores nodes by lowest cumulative cost. The foundation of modern routing.' },
  { id: 'Greedy', name: 'Greedy Best-First', heuristic: true, guaranteed: false, desc: 'Always steps towards the closest-looking node. Very fast, but not always shortest.' },
  { id: 'DFS', name: 'Depth-First Search', heuristic: false, guaranteed: false, desc: 'Explores each branch as deep as possible. Non-optimal and winding paths.' },
];
