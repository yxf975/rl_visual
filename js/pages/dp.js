import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';
import { GRID, ACTIONS, isTerminal, step as envStep, renderGrid, makeV, makePolicy } from '../gridworld.js';

renderNav('dp');
renderAlgoOverview('dp');
mountComicButton(COMICS.dp);

renderGoalCard(null, {
  what: '同一个 4×4 网格世界，但这次<b>环境模型 P 和 R 完全已知</b>。我们用动态规划直接"算出"最优 V* 和最优策略 π*。',
  goal: '直观看到"策略迭代"和"价值迭代"是如何让 V 逐步收敛到最优值的。每个格子的数字会随着迭代越来越逼近真值，策略箭头会指向更好的方向。',
  success: '反复点"单步执行"或"自动收敛"按钮，直到收敛曲线（Δ 值）降到接近 0（对数坐标下看起来直线下降）。此时所有格子的策略箭头都指向宝藏最短路径。',
  metrics: [
    '🗺️ <b>网格颜色/数字</b>：V(s) 值，表示从该状态出发，按当前策略可以赚取的期望总回报',
    '🏹 <b>紫色箭头</b>：当前策略 π(s)，即在该状态下会选的动作',
    '📉 <b>Δ 曲线（对数轴）</b>：相邻两轮 V 的最大变化。持续下降说明在收敛；接近 0 说明收敛。',
  ],
  note: '切换"策略迭代"和"价值迭代"看两者的差异：策略迭代每步代价大但收敛轮次少，价值迭代每步简单但需要更多轮。',
});

let mode = 'policy'; // 'policy' | 'value'
let gamma = 0.9;
let V = makeV();
let policy = makePolicy();
let iter = 0;
let deltas = [];
let converged = false;

const slip = 0; // 动态规划这里使用确定性动作

function expectedQ(x, y, a) {
  const { nx, ny, r } = envStep(x, y, a);
  return r + gamma * V[ny][nx];
}

// 完整策略评估（到收敛）
function policyEvaluation() {
  for (let k = 0; k < 500; k++) {
    let delta = 0;
    const nV = makeV();
    for (let y = 0; y < GRID.rows; y++) {
      for (let x = 0; x < GRID.cols; x++) {
        if (isTerminal(x, y)) continue;
        const a = policy[y][x];
        nV[y][x] = expectedQ(x, y, a);
        delta = Math.max(delta, Math.abs(V[y][x] - nV[y][x]));
      }
    }
    V = nV;
    if (delta < 1e-6) break;
  }
}
function policyImprovement() {
  let stable = true;
  for (let y = 0; y < GRID.rows; y++) {
    for (let x = 0; x < GRID.cols; x++) {
      if (isTerminal(x, y)) continue;
      const qs = [0, 1, 2, 3].map(a => expectedQ(x, y, a));
      let bestA = 0, bestQ = -Infinity;
      for (let a = 0; a < 4; a++) if (qs[a] > bestQ) { bestQ = qs[a]; bestA = a; }
      if (policy[y][x] !== bestA) stable = false;
      policy[y][x] = bestA;
    }
  }
  return stable;
}

// 单步价值迭代
function valueIterationStep() {
  let delta = 0;
  const nV = makeV();
  for (let y = 0; y < GRID.rows; y++) {
    for (let x = 0; x < GRID.cols; x++) {
      if (isTerminal(x, y)) continue;
      const qs = [0, 1, 2, 3].map(a => {
        const { nx, ny, r } = envStep(x, y, a);
        return r + gamma * V[ny][nx];
      });
      let bestA = 0, bestQ = -Infinity;
      qs.forEach((q, a) => { if (q > bestQ) { bestQ = q; bestA = a; } });
      nV[y][x] = bestQ;
      policy[y][x] = bestA;
      delta = Math.max(delta, Math.abs(V[y][x] - bestQ));
    }
  }
  V = nV;
  return delta;
}

const gridBox = document.getElementById('grid-container');
const iterEl = document.getElementById('iter');
const deltaEl = document.getElementById('delta');
const statusEl = document.getElementById('status');
const convChart = echarts.init(document.getElementById('conv-chart'));

function updateChart() {
  convChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 45, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: deltas.map((_, i) => i + 1), name: '轮次' },
    yAxis: { type: 'log', name: 'Δ', min: 1e-6 },
    series: [{ type: 'line', data: deltas.map(d => Math.max(d, 1e-6)), smooth: true, itemStyle: { color: '#ec4899' } }],
  });
}

function rerender() {
  renderGrid(gridBox, { V, policy, cell: 90 });
  iterEl.textContent = iter;
  statusEl.textContent = converged ? '✅ 已收敛' : (iter === 0 ? '待开始' : '迭代中');
  updateChart();
}

function doStep() {
  if (converged) return;
  if (mode === 'policy') {
    const oldV = V.map(row => [...row]);
    policyEvaluation();
    const stable = policyImprovement();
    let maxDelta = 0;
    for (let y = 0; y < GRID.rows; y++) for (let x = 0; x < GRID.cols; x++) maxDelta = Math.max(maxDelta, Math.abs(V[y][x] - oldV[y][x]));
    iter++;
    deltas.push(maxDelta);
    deltaEl.textContent = maxDelta.toFixed(4);
    if (stable && iter > 1) converged = true;
  } else {
    const d = valueIterationStep();
    iter++;
    deltas.push(d);
    deltaEl.textContent = d.toFixed(4);
    if (d < 1e-4) converged = true;
  }
  rerender();
}

let autoTimer = null;
function autoRun() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; return; }
  autoTimer = setInterval(() => {
    doStep();
    if (converged) { clearInterval(autoTimer); autoTimer = null; }
  }, 800);
}

function reset() {
  V = makeV(); policy = makePolicy(); iter = 0; deltas = []; converged = false;
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  deltaEl.textContent = '-';
  rerender();
}

document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    reset();
  });
});
document.getElementById('gamma').addEventListener('input', e => {
  gamma = +e.target.value;
  document.getElementById('gamma-val').textContent = gamma.toFixed(2);
  reset();
});
document.getElementById('step-btn').addEventListener('click', doStep);
document.getElementById('auto-btn').addEventListener('click', autoRun);
document.getElementById('reset-btn').addEventListener('click', reset);

rerender();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🗺️ 彩色热力图', v: '显示每个状态的 V(s) 值。随着迭代进行，你会看到"价值"从宝藏 💎 开始向外扩散。' },
    { k: '🏹 紫色箭头', v: '当前的策略 π(s)。初始随便指，迭代后会全部指向通往宝藏的最短方向。' },
    { k: '📉 Δ 曲线', v: '横轴 = 迭代轮次，纵轴 = V 的最大变化值（对数刻度）。越来越小说明越接近收敛。' },
    { k: '▶ 单步执行', v: '执行一次评估-改进（策略迭代）或一次价值迭代。方便逐步观察。' },
    { k: '⏩ 自动收敛', v: '每 0.8 秒执行一步，直到收敛（或达到最大轮次）。' },
    { k: '🎚️ γ 滑块', v: '折扣因子。γ 越大，V 值传播得越远，需要的迭代轮次也越多。' },
  ],
});

renderFooter();
window.addEventListener('resize', () => convChart.resize());
