// scripts/benchmark.mjs
//
// Seeded, reproducible benchmark of the 5 pathfinding algorithms in
// client/src/algorithms/pathfinding.js across the 4 maze generators.
//
//   node scripts/benchmark.mjs            # default: 200 seeds, grids 25 and 51
//   node scripts/benchmark.mjs --seeds 50 --sizes 25,75 --reps 7
//
// Writes benchmarks/results.json (raw aggregates) and benchmarks/RESULTS.md.
// Exits 1 if the three optimal algorithms (BFS, Dijkstra, A*) ever disagree on
// shortest-path length, so the script doubles as a correctness check.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

import {
  PathNode, bfs, dfs, dijkstra, aStar, greedyBestFirst,
} from '../client/src/algorithms/pathfinding.js';
import {
  generateRecursiveBacktracker, generateRecursiveDivision,
  generateSpiralPattern, generateRandomWalls,
} from '../client/src/algorithms/mazeGenerators.js';

// ---------- args ----------
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const SEEDS = Number(arg('seeds', 200));
const SIZES = String(arg('sizes', '25,51')).split(',').map(Number);
const REPS = Number(arg('reps', 5));

// ---------- seeded RNG (generators use Math.random) ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GENERATORS = {
  Backtracker: generateRecursiveBacktracker,
  Division: generateRecursiveDivision,
  Spiral: generateSpiralPattern, // deterministic: one maze per size
  Random: (r, c, s, e) => generateRandomWalls(r, c, s, e, 0.28), // app default density
};
const ALGOS = { BFS: bfs, Dijkstra: dijkstra, AStar: aStar, Greedy: greedyBestFirst, DFS: dfs };
const OPTIMAL = ['BFS', 'Dijkstra', 'AStar'];

function buildGrid(size, walls, start, end) {
  const wallSet = new Set(walls.map(([r, c]) => r * size + c));
  const grid = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const n = new PathNode(r, c);
      n.isWall = wallSet.has(r * size + c) && !(r === start.row && c === start.col) && !(r === end.row && c === end.col);
      row.push(n);
    }
    grid.push(row);
  }
  return grid;
}

function solveOnce(algo, size, walls, start, end) {
  const grid = buildGrid(size, walls, start, end); // fresh node state every run
  const s = grid[start.row][start.col];
  const e = grid[end.row][end.col];
  const t0 = process.hrtime.bigint();
  const res = ALGOS[algo](grid, s, e);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { ms, expanded: res.visitedNodesInOrder.length, pathLen: res.shortestPathNodes.length ? res.shortestPathNodes.length - 1 : null };
}

const median = (xs) => { const a = [...xs].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const pct = (xs, p) => { const a = [...xs].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };

// ---------- run ----------
const results = [];
let disagreements = 0;
const realRandom = Math.random;

for (const size of SIZES) {
  const start = { row: 2, col: 2 };
  const end = { row: size - 3, col: size - 3 };
  for (const [genName, gen] of Object.entries(GENERATORS)) {
    const seeds = genName === 'Spiral' ? 1 : SEEDS;
    const per = Object.fromEntries(Object.keys(ALGOS).map((a) => [a, { ms: [], expanded: [], gap: [], optimal: 0 }]));
    let solvable = 0;
    for (let seed = 1; seed <= seeds; seed++) {
      Math.random = mulberry32(seed * 7919 + size);
      const walls = gen(size, size, start, end);
      Math.random = realRandom;

      const ref = solveOnce('BFS', size, walls, start, end);
      if (ref.pathLen === null) continue; // unsolvable maze: skip for every algorithm
      solvable++;

      for (const algo of Object.keys(ALGOS)) {
        solveOnce(algo, size, walls, start, end); // warm-up
        const runs = Array.from({ length: REPS }, () => solveOnce(algo, size, walls, start, end));
        const r = runs[0];
        per[algo].ms.push(median(runs.map((x) => x.ms)));
        per[algo].expanded.push(r.expanded);
        per[algo].gap.push((r.pathLen - ref.pathLen) / ref.pathLen);
        if (r.pathLen === ref.pathLen) per[algo].optimal++;
        if (OPTIMAL.includes(algo) && r.pathLen !== ref.pathLen) {
          disagreements++;
          console.error(`DISAGREE size=${size} gen=${genName} seed=${seed} ${algo}=${r.pathLen} BFS=${ref.pathLen}`);
        }
      }
    }
    for (const [algo, d] of Object.entries(per)) {
      if (!d.ms.length) continue;
      results.push({
        size, generator: genName, algorithm: algo, mazes: solvable, mazesGenerated: seeds,
        expandedMean: mean(d.expanded), expandedMedian: median(d.expanded),
        msMedian: median(d.ms), msP95: pct(d.ms, 0.95),
        optimalRate: d.optimal / d.ms.length, pathGapMeanPct: 100 * mean(d.gap),
      });
    }
    console.log(`size ${size} ${genName}: ${solvable}/${seeds} solvable`);
  }
}

// ---------- report ----------
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'benchmarks');
mkdirSync(outDir, { recursive: true });
const meta = {
  generatedAt: new Date().toISOString(), node: process.version, cpu: os.cpus()[0]?.model,
  seeds: SEEDS, sizes: SIZES, repsPerSolve: REPS, start: '(2,2)', end: '(size-3,size-3)',
  randomWallDensity: 0.28, optimalAlgorithmDisagreements: disagreements,
};
writeFileSync(join(outDir, 'results.json'), JSON.stringify({ meta, results }, null, 2));

const f = (x, d = 1) => x.toFixed(d);
let md = `# Pathfinding benchmark\n\nGenerated by \`node scripts/benchmark.mjs\` on ${meta.generatedAt.slice(0, 10)}.\n\n`;
md += `- Node ${meta.node}, CPU: ${meta.cpu}\n- ${SEEDS} seeded mazes per generator and size (Spiral is deterministic: 1 maze per size); unsolvable mazes are skipped\n`;
md += `- Start (2,2), end (size-3, size-3); random-scatter density 0.28 (app default); timing = median of ${REPS} runs after a warm-up\n`;
md += `- Shortest-path disagreements between BFS, Dijkstra and A*: **${disagreements}**\n\n`;
md += `"Expanded" = nodes popped from the frontier (\`visitedNodesInOrder\`). "Path gap" = extra path length vs the BFS shortest path.\n\n`;
for (const size of SIZES) {
  for (const gen of Object.keys(GENERATORS)) {
    const rows = results.filter((r) => r.size === size && r.generator === gen);
    if (!rows.length) continue;
    const bfsRow = rows.find((r) => r.algorithm === 'BFS');
    md += `## ${size}x${size} · ${gen} (${rows[0].mazes}/${rows[0].mazesGenerated} solvable)\n\n`;
    md += `| Algorithm | Expanded (mean) | vs BFS | Time median (ms) | Time p95 (ms) | Optimal path | Path gap (mean) |\n|---|---|---|---|---|---|---|\n`;
    for (const r of rows) {
      const vs = 100 * (1 - r.expandedMean / bfsRow.expandedMean);
      md += `| ${r.algorithm} | ${f(r.expandedMean)} | ${r.algorithm === 'BFS' ? '—' : `${vs >= 0 ? '−' : '+'}${f(Math.abs(vs))}%`} | ${f(r.msMedian, 3)} | ${f(r.msP95, 3)} | ${f(100 * r.optimalRate)}% | ${f(r.pathGapMeanPct)}% |\n`;
    }
    md += '\n';
  }
}
writeFileSync(join(outDir, 'RESULTS.md'), md);
console.log(`\nWrote benchmarks/results.json and benchmarks/RESULTS.md (disagreements: ${disagreements})`);
process.exit(disagreements ? 1 : 0);
