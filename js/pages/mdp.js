import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';
import { GRID, ACTIONS, inGrid, step as envStep, isTerminal, renderGrid, makeV } from '../gridworld.js';

renderNav('mdp');
renderAlgoOverview('mdp');
mountComicButton(COMICS.mdp);

// 训练目标卡
renderGoalCard(null, {
  what: '<b>4×4 网格世界</b>。机器人 🤖 从左上角 🏁 出发，想到右下角 💎 拿宝藏，沿途要避开 💣 陷阱。每走一步都有代价。',
  goal: '理解 MDP 五元组 &lt;S, A, P, R, γ&gt; 各自是什么，以及价值函数 V(s) 如何表达"这个状态未来能赚多少"。',
  success: '拖动 γ 和滑动概率滑块，观察价值热力图（格子颜色）如何变化。γ 大 → 宝藏附近的"高价值"会向远处扩散；滑动概率大 → 整体价值变低（"世界更不靠谱"）。',
  metrics: [
    '🎨 <b>格子颜色</b>：红热蓝冷，体现每个状态的 V 值',
    '🔢 <b>格子数字</b>：V(s) 精确值（随机策略下的评估结果）',
    '👆 <b>点击任意格子</b>：右侧面板显示该状态的 4 个动作 Q 值及最优动作',
  ],
  note: '这里计算的是"均匀随机策略"下的 V —— 每个动作概率都是 0.25。下一章动态规划会教你怎么算最优策略。',
});

let gamma = 0.9, slip = 0.1;
let V = makeV();
let agent = [...GRID.start];
let path = [[...GRID.start]];
let playing = false;

// 策略评估（随机策略，给出每个状态的 V）
function evaluateRandomPolicy() {
  V = makeV();
  // 迭代评估
  for (let iter = 0; iter < 200; iter++) {
    let delta = 0;
    const nV = makeV();
    for (let y = 0; y < GRID.rows; y++) {
      for (let x = 0; x < GRID.cols; x++) {
        if (isTerminal(x, y)) { nV[y][x] = 0; continue; }
        let sum = 0;
        for (let a = 0; a < 4; a++) {
          // 主动作执行概率 1-slip，滑动执行其他三方向各 slip/3
          const targets = [];
          targets.push({ a, p: 1 - slip });
          for (let a2 = 0; a2 < 4; a2++) {
            if (a2 !== a) targets.push({ a: a2, p: slip / 3 });
          }
          let q = 0;
          for (const t of targets) {
            const { nx, ny, r } = envStep(x, y, t.a);
            q += t.p * (r + gamma * V[ny][nx]);
          }
          sum += 0.25 * q;
        }
        nV[y][x] = sum;
        delta = Math.max(delta, Math.abs(V[y][x] - sum));
      }
    }
    V = nV;
    if (delta < 1e-4) break;
  }
}

const gridBox = document.getElementById('grid-container');
const detailBox = document.getElementById('cell-detail');

function rerender() {
  evaluateRandomPolicy();
  renderGrid(gridBox, { V, agent, path, cell: 90 });
  attachClicks();
}

function attachClicks() {
  const svg = gridBox.querySelector('svg');
  if (!svg) return;
  svg.style.cursor = 'pointer';
  svg.querySelectorAll('rect').forEach((rect, idx) => {
    const y = Math.floor(idx / GRID.cols);
    const x = idx % GRID.cols;
    rect.addEventListener('click', () => showDetail(x, y));
  });
}

function showDetail(x, y) {
  if (isTerminal(x, y)) {
    detailBox.innerHTML = `<p><b>🎯 状态 (${x},${y}) — 终止状态</b></p><p class="text-xs text-gray-500 mt-1">游戏在此处结束。</p>`;
    return;
  }
  const qs = [];
  for (let a = 0; a < 4; a++) {
    const { nx, ny, r } = envStep(x, y, a);
    const q = r + gamma * V[ny][nx];
    qs.push({ a, name: ACTIONS[a].name, q, r });
  }
  const best = qs.reduce((m, c) => c.q > m.q ? c : m);
  detailBox.innerHTML = `
    <p class="font-bold text-brand-600 mb-2">📍 状态 (${x}, ${y})</p>
    <p class="text-xs mb-1">V(s) = <b>${V[y][x].toFixed(3)}</b></p>
    <div class="grid grid-cols-2 gap-1 text-xs mt-2">
      ${qs.map(q => `
        <div class="p-1.5 rounded ${q === best ? 'bg-green-100 border border-green-400' : 'bg-gray-50'}">
          <b>${q.name}</b> Q=${q.q.toFixed(2)}
        </div>
      `).join('')}
    </div>
    <p class="text-xs text-gray-500 mt-2">🎯 最优动作: <b class="text-green-700">${best.name}</b></p>
  `;
}

async function playTrajectory() {
  if (playing) return;
  playing = true;
  agent = [...GRID.start]; path = [[...agent]];
  document.getElementById('play-btn').textContent = '⏸ 播放中...';
  document.getElementById('play-btn').disabled = true;

  for (let i = 0; i < 30; i++) {
    if (isTerminal(agent[0], agent[1])) break;
    // 随机策略，但带滑动
    let a = Math.floor(Math.random() * 4);
    if (Math.random() < slip) {
      const alt = [0, 1, 2, 3].filter(x => x !== a);
      a = alt[Math.floor(Math.random() * 3)];
    }
    const { nx, ny } = envStep(agent[0], agent[1], a);
    agent = [nx, ny];
    path.push([...agent]);
    renderGrid(gridBox, { V, agent, path, cell: 90 });
    attachClicks();
    await new Promise(r => setTimeout(r, 600));
  }
  playing = false;
  const btn = document.getElementById('play-btn');
  btn.textContent = '▶ 播放随机轨迹';
  btn.disabled = false;
}

document.getElementById('gamma').addEventListener('input', e => {
  gamma = +e.target.value;
  document.getElementById('gamma-val').textContent = gamma.toFixed(2);
  rerender();
});
document.getElementById('slip').addEventListener('input', e => {
  slip = +e.target.value;
  document.getElementById('slip-val').textContent = slip.toFixed(2);
  rerender();
});
document.getElementById('play-btn').addEventListener('click', playTrajectory);
document.getElementById('reset-btn').addEventListener('click', () => {
  agent = [...GRID.start]; path = [[...agent]];
  rerender();
  detailBox.innerHTML = '<p class="text-gray-400 italic">点击任意格子查看详情...</p>';
});

rerender();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🏁 起点', v: '状态 (0,0)，机器人每次被重置时都回到这里。' },
    { k: '💎 终点', v: '状态 (3,3)，达到后回合结束，获得 +10 奖励。' },
    { k: '💣 陷阱', v: '触发后回合结束，获得 -10 惩罚。' },
    { k: '🤖 智能体', v: '当前机器人所处位置。点击"播放轨迹"看它随机走动。' },
    { k: '🎨 格子颜色', v: '热力图表示 V(s) —— 红色代表高价值（靠近宝藏），蓝色代表低价值（靠近陷阱）。' },
    { k: '🔢 格子数字', v: '该状态的精确 V 值。负值说明从这里开始平均会亏损，正值说明平均会赚。' },
    { k: '🎚️ γ 滑块', v: '折扣因子。γ↑ → 未来更"值钱"，高价值会向更远处传播。' },
    { k: '🎚️ 滑动概率', v: '环境随机性。0 = 完全听话；0.5 = 一半时间打滑到其他方向。' },
  ],
});

renderFooter();
