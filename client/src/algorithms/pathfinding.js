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

// Binary min-heap keyed on (priority, tie, insertion order). `tie` is an
// optional secondary key (A* passes h to prefer nodes closer to the target);
// the insertion counter then breaks remaining ties first-in-first-out, so
// equal-cost nodes come out in a stable, deterministic order.
// push and pop are O(log n).
class MinHeap {
  constructor() {
    this.items = [];
    this.counter = 0;
  }

  get size() {
    return this.items.length;
  }

  push(node, priority, tie = 0) {
    const items = this.items;
    items.push({ node, priority, tie, order: this.counter++ });
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(items[i], items[parent])) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let smallest = i;
        if (l < items.length && this.less(items[l], items[smallest])) smallest = l;
        if (r < items.length && this.less(items[r], items[smallest])) smallest = r;
        if (smallest === i) break;
        [items[i], items[smallest]] = [items[smallest], items[i]];
        i = smallest;
      }
    }
    return top;
  }

  less(a, b) {
    if (a.priority !== b.priority) return a.priority < b.priority;
    if (a.tie !== b.tie) return a.tie < b.tie;
    return a.order < b.order;
  }
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
// Uses a binary-heap priority queue (O((V + E) log V)) instead of re-sorting
// every cell on every step. Nodes are pushed again when their distance
// improves; stale heap entries are skipped when popped (lazy deletion).
export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const heap = new MinHeap();
  heap.push(startNode, 0);

  while (heap.size > 0) {
    const { node: closestNode, priority } = heap.pop();

    if (closestNode.isVisited || priority > closestNode.distance) continue;

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
        heap.push(neighbor, alt);
      }
    }
  }

  return { visitedNodesInOrder, shortestPathNodes: [] };
}

// 4. A* Search (A-Star) - Heuristic Informed (f = g + h)
// The open set is a binary heap ordered by f, then h (same order as before),
// instead of an array re-sorted on every pop with an O(n) includes() check.
// A node is pushed again when its g improves; stale entries are skipped.
export function aStar(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const openSet = new MinHeap();
  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.h;
  openSet.push(startNode, startNode.f, startNode.h);

  while (openSet.size > 0) {
    const { node: current, priority } = openSet.pop();

    if (current.isVisited || priority > current.f) continue;

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
        openSet.push(neighbor, neighbor.f, neighbor.h);
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
