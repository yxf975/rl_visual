// 通用网格世界工具：4x4 默认环境
export const GRID = {
  rows: 4, cols: 4,
  start: [0, 0],
  goal: [3, 3],
  traps: [[1, 1], [2, 2]],
  rewardGoal: 10,
  rewardTrap: -10,
  rewardStep: -1,
};

export const ACTIONS = [
  { dx: 0, dy: -1, name: '↑' },
  { dx: 1, dy: 0, name: '→' },
  { dx: 0, dy: 1, name: '↓' },
  { dx: -1, dy: 0, name: '←' },
];

export function inGrid(x, y) { return x >= 0 && x < GRID.cols && y >= 0 && y < GRID.rows; }

export function isTerminal(x, y) {
  if (x === GRID.goal[0] && y === GRID.goal[1]) return true;
  return GRID.traps.some(t => t[0] === x && t[1] === y);
}

export function step(x, y, aIdx) {
  const a = ACTIONS[aIdx];
  let nx = x + a.dx, ny = y + a.dy;
  if (!inGrid(nx, ny)) { nx = x; ny = y; }
  let r = GRID.rewardStep;
  if (nx === GRID.goal[0] && ny === GRID.goal[1]) r = GRID.rewardGoal;
  else if (GRID.traps.some(t => t[0] === nx && t[1] === ny)) r = GRID.rewardTrap;
  return { nx, ny, r, done: isTerminal(nx, ny) };
}

// 渲染网格 SVG（通用）
export function renderGrid(container, opts = {}) {
  const cell = opts.cell || 80;
  const rows = GRID.rows, cols = GRID.cols;
  const w = cols * cell, h = rows * cell;
  const V = opts.V || null;          // 状态价值二维数组 V[y][x]
  const policy = opts.policy || null; // 策略 policy[y][x] = 0..3
  const agent = opts.agent || null;    // [x,y]
  const path = opts.path || null;      // [[x,y]...]

  // 颜色映射：heat map
  let vMin = Infinity, vMax = -Infinity;
  if (V) V.forEach(row => row.forEach(v => { if (v < vMin) vMin = v; if (v > vMax) vMax = v; }));
  const colorFor = v => {
    if (!V) return '#ffffff';
    const t = (v - vMin) / Math.max(1e-6, vMax - vMin);
    // 蓝 → 白 → 红
    if (t < 0.5) {
      const k = t * 2;
      return `rgb(${Math.round(180 + k * 75)},${Math.round(200 + k * 55)},255)`;
    } else {
      const k = (t - 0.5) * 2;
      return `rgb(255,${Math.round(255 - k * 100)},${Math.round(255 - k * 155)})`;
    }
  };

  let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;display:block;margin:0 auto;background:#fff;border-radius:8px;">`;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = V ? V[y][x] : 0;
      const fill = colorFor(v);
      svg += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fill}" stroke="#94a3b8" stroke-width="1"/>`;

      // 起点/终点/陷阱图标
      if (x === GRID.start[0] && y === GRID.start[1]) {
        svg += `<text x="${x * cell + cell * 0.15}" y="${y * cell + cell * 0.3}" font-size="${cell * 0.22}">🏁</text>`;
      }
      if (x === GRID.goal[0] && y === GRID.goal[1]) {
        svg += `<text x="${x * cell + cell * 0.3}" y="${y * cell + cell * 0.65}" font-size="${cell * 0.5}">💎</text>`;
      }
      if (GRID.traps.some(t => t[0] === x && t[1] === y)) {
        svg += `<text x="${x * cell + cell * 0.3}" y="${y * cell + cell * 0.65}" font-size="${cell * 0.5}">💣</text>`;
      }
      // 价值文本
      if (V) {
        svg += `<text x="${x * cell + cell / 2}" y="${y * cell + cell - 8}" text-anchor="middle" font-size="${cell * 0.16}" fill="#374151" font-weight="600">${v.toFixed(2)}</text>`;
      }
      // 策略箭头
      if (policy && !isTerminal(x, y)) {
        const a = ACTIONS[policy[y][x]];
        svg += `<text x="${x * cell + cell / 2}" y="${y * cell + cell * 0.45}" text-anchor="middle" font-size="${cell * 0.3}" fill="#8b5cf6" font-weight="900">${a.name}</text>`;
      }
    }
  }
  // 智能体
  if (agent) {
    svg += `<text x="${agent[0] * cell + cell / 2}" y="${agent[1] * cell + cell * 0.65}" text-anchor="middle" font-size="${cell * 0.5}">🤖</text>`;
  }
  // 路径
  if (path && path.length > 1) {
    const pts = path.map(p => `${p[0] * cell + cell / 2},${p[1] * cell + cell / 2}`).join(' ');
    svg += `<polyline points="${pts}" fill="none" stroke="#ec4899" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
  }
  svg += '</svg>';
  container.innerHTML = svg;
}

// 创建一个 V(s) 全零矩阵
export function makeV() {
  return Array.from({ length: GRID.rows }, () => Array(GRID.cols).fill(0));
}
export function makePolicy() {
  return Array.from({ length: GRID.rows }, () => Array(GRID.cols).fill(0));
}
