import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderScenePicker, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('bandit');
renderAlgoOverview('bandit');
mountComicButton(COMICS.bandit);

// 训练目标卡
renderGoalCard(null, {
  goal: '用尽可能少的拉杆次数，累计尽可能多的奖励。也就是让"累计奖励曲线"越陡越好。',
  success: '标准场景下会收敛到选最优臂。非平稳场景则考验算法的"适应能力"：突变后能否快速切换到新最优？',
  metrics: [
    '🟣 <b>估计价值 vs 真实价值</b>：柱状图越接近真值，说明估计越准确',
    '🟢 <b>累计奖励曲线</b>：斜率越大说明算法越高效',
    '🟡 <b>各臂选择次数饼图</b>：集中说明"利用"，分散说明"探索"',
  ],
});

// ========== 环境与状态 ==========
const SCENES = {
  std5: { name: '标准 5 臂', probs: [0.2, 0.45, 0.6, 0.8, 0.35], nonstationary: false },
  big10: { name: '10 臂大池', probs: [0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.9], nonstationary: false },
  drift: { name: '非平稳 5 臂', probs: [0.2, 0.45, 0.6, 0.8, 0.35], nonstationary: true },
};
let currentScene = 'std5';
let TRUE_PROBS = [...SCENES[currentScene].probs];
let NON_STATIONARY = SCENES[currentScene].nonstationary;
let N_BANDITS = TRUE_PROBS.length;

let strategy = 'eps';
let epsilon = 0.1;
let totalSteps = 500;

let state = null; // { pulls:[], rewards:[], cumReward:0, step:0, history:[] }
let compareHistories = {}; // {strategy: [cum奖励数组]}

function initState() {
  return {
    pulls: Array(N_BANDITS).fill(0),
    rewardsSum: Array(N_BANDITS).fill(0),
    estimates: Array(N_BANDITS).fill(0),
    alpha: Array(N_BANDITS).fill(1), // thompson beta 参数
    beta: Array(N_BANDITS).fill(1),
    cumReward: 0, step: 0,
    cumHistory: [0],
    lastAction: -1, lastReward: 0,
  };
}

// ========== DOM ==========
const banditBox = document.getElementById('bandits-container');
const stepEl = document.getElementById('step-count');
const stepTotalEl = document.getElementById('step-total');
const totalRewardEl = document.getElementById('total-reward');
const lastActionEl = document.getElementById('last-action');

function renderBandits(highlightIdx = -1) {
  banditBox.innerHTML = TRUE_PROBS.map((p, i) => {
    const pulls = state ? state.pulls[i] : 0;
    const est = state ? state.estimates[i].toFixed(2) : '0.00';
    const isHi = i === highlightIdx;
    return `
      <div class="text-center p-3 rounded-xl border-2 transition ${isHi ? 'bg-yellow-100 border-yellow-500 scale-105 shadow-lg' : 'bg-white border-gray-200'}">
        <div class="text-4xl mb-1 ${isHi ? 'animate-bounce' : ''}">🎰</div>
        <div class="text-xs font-bold text-gray-500">#${i + 1} 号机</div>
        <div class="text-xs mt-1">真实: <b class="text-green-600">${p}</b></div>
        <div class="text-xs">估计: <b class="text-brand-600">${est}</b></div>
        <div class="text-xs text-gray-400">拉取 ${pulls} 次</div>
      </div>
    `;
  }).join('');
}

// ========== 图表 ==========
const valueChart = echarts.init(document.getElementById('value-chart'));
const rewardChart = echarts.init(document.getElementById('reward-chart'));
const pullChart = echarts.init(document.getElementById('pull-chart'));

function updateValueChart() {
  valueChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['真实价值', '估计价值'], top: 0 },
    grid: { top: 30, left: 40, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: TRUE_PROBS.map((_, i) => `#${i + 1}`) },
    yAxis: { type: 'value', max: 1 },
    series: [
      { name: '真实价值', type: 'bar', data: TRUE_PROBS, itemStyle: { color: '#10b981' } },
      { name: '估计价值', type: 'bar', data: state ? state.estimates.map(v => +v.toFixed(3)) : Array(N_BANDITS).fill(0), itemStyle: { color: '#8b5cf6' } },
    ],
  });
}

function updateRewardChart() {
  const series = Object.entries(compareHistories).map(([name, data]) => ({
    name, type: 'line', data, showSymbol: false, smooth: true,
  }));
  if (state && state.cumHistory.length) {
    series.push({ name: strategy + '（当前）', type: 'line', data: state.cumHistory, showSymbol: false, smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#ec4899' } });
  }
  rewardChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 45, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({length: Math.max(1, state ? state.cumHistory.length : 1)}, (_, i) => i) },
    yAxis: { type: 'value', name: '累计奖励' },
    series,
  });
}

function updatePullChart() {
  pullChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 0 },
    series: [{
      type: 'pie', radius: ['30%', '65%'],
      data: TRUE_PROBS.map((_, i) => ({ value: state ? state.pulls[i] : 0, name: `#${i + 1} 号机` })),
      label: { formatter: '{b}: {c} 次' },
    }],
  });
}

// ========== 策略 ==========
function selectAction(st) {
  if (strategy === 'eps') {
    if (Math.random() < epsilon) return Math.floor(Math.random() * N_BANDITS);
    return argmax(st.estimates);
  }
  if (strategy === 'ucb') {
    const t = st.step + 1;
    const c = 2;
    const scores = st.estimates.map((q, i) => st.pulls[i] === 0 ? Infinity : q + c * Math.sqrt(Math.log(t) / st.pulls[i]));
    return argmax(scores);
  }
  if (strategy === 'thompson') {
    const samples = st.alpha.map((a, i) => sampleBeta(a, st.beta[i]));
    return argmax(samples);
  }
}
function argmax(arr) {
  let m = -Infinity, idx = 0;
  for (let i = 0; i < arr.length; i++) if (arr[i] > m) { m = arr[i]; idx = i; }
  return idx;
}
function sampleBeta(a, b) {
  // 粗略的 Beta 采样：使用 Gamma 近似（这里简化用均值+噪声也能呈现效果）
  const x = gammaSample(a); const y = gammaSample(b);
  return x / (x + y);
}
function gammaSample(k) {
  // Marsaglia-Tsang
  if (k < 1) return gammaSample(k + 1) * Math.pow(Math.random(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do { x = randn(); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ========== 执行 ==========
function step() {
  // 非平稳：约半程将最优臂与最差臂互换
  if (NON_STATIONARY && state.step === Math.floor(totalSteps / 2)) {
    const maxI = argmax(TRUE_PROBS);
    let minI = 0, minV = Infinity;
    TRUE_PROBS.forEach((v, i) => { if (v < minV) { minV = v; minI = i; } });
    [TRUE_PROBS[maxI], TRUE_PROBS[minI]] = [TRUE_PROBS[minI], TRUE_PROBS[maxI]];
  }
  const a = selectAction(state);
  const r = Math.random() < TRUE_PROBS[a] ? 1 : 0;
  state.pulls[a]++;
  state.rewardsSum[a] += r;
  state.estimates[a] = state.rewardsSum[a] / state.pulls[a];
  if (strategy === 'thompson') {
    if (r === 1) state.alpha[a]++;
    else state.beta[a]++;
  }
  state.cumReward += r;
  state.step++;
  state.cumHistory.push(state.cumReward);
  state.lastAction = a; state.lastReward = r;
  return a;
}

let running = false;
let timer = null;
async function startSim() {
  if (running) return;
  running = true;
  state = initState();
  const startBtn = document.getElementById('start-btn');
  startBtn.textContent = '⏸ 运行中...';
  startBtn.disabled = true;

  const animSteps = Math.min(50, totalSteps); // 前 50 步动画播放
  for (let i = 0; i < totalSteps; i++) {
    const a = step();
    if (i < animSteps) {
      renderBandits(a);
      stepEl.textContent = state.step;
      totalRewardEl.textContent = state.cumReward.toFixed(1);
      lastActionEl.textContent = `#${a + 1} 号机（奖励 ${state.lastReward}）`;
      updateValueChart();
      if (i % 5 === 0) updateRewardChart();
      await sleep(150);
    }
  }
  // 一次性收尾
  renderBandits(-1);
  stepEl.textContent = state.step;
  totalRewardEl.textContent = state.cumReward.toFixed(1);
  updateValueChart();
  updateRewardChart();
  updatePullChart();

  // 把本次结果加入对比历史（采样到200点）
  compareHistories[strategy] = sampleArray(state.cumHistory, 200);

  startBtn.textContent = '▶ 开始模拟';
  startBtn.disabled = false;
  running = false;
}
function sampleArray(arr, n) {
  if (arr.length <= n) return arr.slice();
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========== 事件 ==========
document.querySelectorAll('[data-strategy]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-strategy]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    strategy = btn.dataset.strategy;
  });
});

document.getElementById('eps-slider').addEventListener('input', e => {
  epsilon = +e.target.value;
  document.getElementById('eps-value').textContent = epsilon.toFixed(2);
});
document.getElementById('steps-slider').addEventListener('input', e => {
  totalSteps = +e.target.value;
  document.getElementById('steps-value').textContent = totalSteps;
  stepTotalEl.textContent = totalSteps;
});

document.getElementById('start-btn').addEventListener('click', startSim);
document.getElementById('reset-btn').addEventListener('click', () => {
  state = initState();
  compareHistories = {};
  stepEl.textContent = 0;
  totalRewardEl.textContent = '0.0';
  lastActionEl.textContent = '-';
  renderBandits();
  updateValueChart();
  updateRewardChart();
  updatePullChart();
});

// 初始化
state = initState();
renderBandits();
updateValueChart();
updateRewardChart();
updatePullChart();
window.addEventListener('resize', () => {
  valueChart.resize(); rewardChart.resize(); pullChart.resize();
});

// 场景选择器
renderScenePicker('#scene-picker-slot', [
  { id: 'std5', icon: '🎰', label: '标准 5 臂', desc: '经典入门' },
  { id: 'big10', icon: '🎲', label: '10 臂大池', desc: '更大的搜索空间' },
  { id: 'drift', icon: '🌀', label: '非平稳', desc: '中途概率突变，考验适应性' },
], 'std5', (id) => {
  currentScene = id;
  TRUE_PROBS = [...SCENES[id].probs];
  NON_STATIONARY = SCENES[id].nonstationary;
  N_BANDITS = TRUE_PROBS.length;
  state = initState();
  compareHistories = {};
  stepEl.textContent = 0;
  totalRewardEl.textContent = '0.0';
  lastActionEl.textContent = '-';
  renderBandits();
  updateValueChart();
  updateRewardChart();
  updatePullChart();
});

// 在页面底部注入"读懂动画"说明
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🎰 老虎机卡片', v: '每台显示"真实概率"（绿色，上帝视角）与"估计概率"（紫色，算法学到的）。被选中的会高亮跳动。' },
    { k: '🟡 高亮黄框', v: '表示算法当前步选择了哪一台。' },
    { k: '📊 柱状图', v: '绿柱 = 真实价值；紫柱 = 估计价值。训练目标就是让紫柱尽可能贴近绿柱。' },
    { k: '📈 累计奖励', v: '曲线斜率 = 每步平均奖励。越陡说明策略越好。多策略对比曲线会显示不同颜色。' },
    { k: '🥧 饼图', v: '展示总共 N 步中每台老虎机被选中的比例。好算法会集中在最优臂。' },
    { k: '⚙️ 参数面板', v: 'ε 越大越爱探索；步数越多，估计越准但耗时更长。' },
  ],
});

renderFooter();
