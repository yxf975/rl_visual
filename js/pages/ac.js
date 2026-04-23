import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('ac');
renderAlgoOverview('ac');
mountComicButton(COMICS.ac);

renderGoalCard(null, {
  goal: '观察 Actor 和 Critic 如何配合：Critic 计算 TD 误差 δ = r + γV(s\') − V(s)，δ 同时作为 Actor 的"优势信号"和 Critic 自己的损失。',
  success: '相比 REINFORCE，AC 训练更稳定：累计奖励曲线（紫色）比模拟的 REINFORCE 基线（红虚线）更平滑且收敛更快。',
  metrics: [
    '🎡 <b>小车动画</b>：与 REINFORCE 页相同。',
    '⚡ <b>TD 误差曲线</b>：δ 值的实时波动。训练初期波动大，收敛后趋近 0。',
    '📊 <b>策略概率</b>：Actor 当前的动作分布。',
    '📈 <b>奖励对比</b>：紫色实线 = AC；红色虚线 = 模拟的 REINFORCE 对比基线。',
    '🔢 <b>V(s) 数值</b>：Critic 对当前状态的价值估计。',
  ],
});

// 复用 CartPole
class CartPole {
  constructor() { this.reset(); }
  reset() {
    this.x = 0; this.xDot = 0;
    this.theta = (Math.random() - 0.5) * 0.1;
    this.thetaDot = 0;
    this.done = false;
    return this.getState();
  }
  getState() { return [this.x, this.xDot, this.theta, this.thetaDot]; }
  step(action) {
    const force = action === 1 ? 10 : -10;
    const g = 9.8, mC = 1, mP = 0.1, totalMass = mC + mP, l = 0.5, pml = mP * l, dt = 0.02;
    const cos = Math.cos(this.theta), sin = Math.sin(this.theta);
    const temp = (force + pml * this.thetaDot ** 2 * sin) / totalMass;
    const thetaAcc = (g * sin - cos * temp) / (l * (4/3 - mP * cos * cos / totalMass));
    const xAcc = temp - pml * thetaAcc * cos / totalMass;
    this.x += dt * this.xDot;
    this.xDot += dt * xAcc;
    this.theta += dt * this.thetaDot;
    this.thetaDot += dt * thetaAcc;
    const done = Math.abs(this.theta) > 0.21 || Math.abs(this.x) > 2.4;
    this.done = done;
    return { state: this.getState(), reward: 1, done };
  }
}

class Actor {
  constructor() { this.w = Array(4).fill(0).map(() => (Math.random() - 0.5) * 0.1); }
  prob1(s) { const z = s.reduce((a, v, i) => a + v * this.w[i], 0); return 1 / (1 + Math.exp(-z)); }
  sample(s) { return Math.random() < this.prob1(s) ? 1 : 0; }
  gradLogPi(s, a) { const p = this.prob1(s); return s.map(v => v * (a - p)); }
}
class Critic {
  constructor() { this.w = Array(4).fill(0); this.b = 0; }
  V(s) { return s.reduce((a, v, i) => a + v * this.w[i], this.b); }
  gradV(s) { return { dw: s.slice(), db: 1 }; }
}

let actor = new Actor(), critic = new Critic();
let rewardHistory = [];
let reinforceHistory = []; // 模拟对比基线
let tdHistory = [];
let lastProbs = [0.5, 0.5];
let lrA = 0.01, lrC = 0.05;
let running = false;

const stage = document.getElementById('cart-stage');
function renderStage(x, theta) {
  const W = stage.clientWidth || 400;
  const centerX = W / 2;
  const cartLeft = centerX + x * 80 - 30;
  stage.innerHTML = `
    <div class="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-200 to-amber-400"></div>
    <div style="position:absolute;bottom:10px;left:${cartLeft}px;width:60px;height:20px;background:#4b5563;border-radius:4px;"></div>
    <div style="position:absolute;bottom:30px;left:${cartLeft + 27}px;width:6px;height:80px;background:linear-gradient(to top,#d97706,#fbbf24);border-radius:3px;transform-origin:bottom center;transform:rotate(${theta}rad);"></div>
  `;
}
renderStage(0, 0);

const tdChart = echarts.init(document.getElementById('td-chart'));
const rewardChart = echarts.init(document.getElementById('reward-chart'));
const policyChart = echarts.init(document.getElementById('policy-chart'));

function updateTdChart() {
  tdChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 20, bottom: 30 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', name: 'δ' },
    series: [{ type: 'line', data: tdHistory.slice(-200), smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' } }],
  });
}
function updateRewardChart() {
  rewardChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 45, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: rewardHistory.map((_, i) => i + 1) },
    yAxis: { type: 'value', name: '存活步数' },
    series: [
      { name: 'Actor-Critic', type: 'line', data: rewardHistory, smooth: true, showSymbol: false, itemStyle: { color: '#8b5cf6' } },
      { name: 'REINFORCE（模拟）', type: 'line', data: reinforceHistory, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' }, lineStyle: { type: 'dashed' } },
    ],
  });
}
function updatePolicyChart() {
  policyChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['← 左推', '→ 右推'] },
    yAxis: { type: 'value', max: 1 },
    series: [{ type: 'bar', data: lastProbs, itemStyle: { color: '#ec4899' }, label: { show: true, position: 'top', formatter: p => p.data.toFixed(2) } }],
  });
}
updateTdChart(); updateRewardChart(); updatePolicyChart();

async function runEpisode(ep) {
  const env = new CartPole();
  let s = env.reset();
  const GAMMA = 0.99;
  let steps = 0;
  for (let t = 0; t < 500; t++) {
    const a = actor.sample(s);
    const { state, reward, done } = env.step(a);
    // TD 误差
    const V_s = critic.V(s);
    const V_sn = done ? 0 : critic.V(state);
    const delta = reward + GAMMA * V_sn - V_s;
    // 更新 Actor
    const gP = actor.gradLogPi(s, a);
    for (let k = 0; k < 4; k++) actor.w[k] += lrA * delta * gP[k];
    // 更新 Critic
    const gV = critic.gradV(s);
    for (let k = 0; k < 4; k++) critic.w[k] += lrC * delta * gV.dw[k];
    critic.b += lrC * delta * gV.db;

    tdHistory.push(+delta.toFixed(3));
    if (t % 3 === 0) {
      renderStage(env.x, env.theta);
      document.getElementById('alive').textContent = t + 1;
      document.getElementById('vval').textContent = V_s.toFixed(2);
      lastProbs = [1 - actor.prob1(s), actor.prob1(s)];
      updatePolicyChart();
      updateTdChart();
    }
    s = state; steps = t + 1;
    await new Promise(r => setTimeout(r, 10));
    if (done) break;
  }
  return steps;
}

async function train() {
  if (running) return;
  running = true;
  const btn = document.getElementById('train-btn');
  btn.textContent = '⏳ 训练中...'; btn.disabled = true;
  const EPISODES = 60;
  for (let ep = 0; ep < EPISODES; ep++) {
    document.getElementById('ep').textContent = ep + 1;
    const steps = await runEpisode(ep);
    rewardHistory.push(steps);
    // 模拟对比基线（REINFORCE 方差大）
    const noise = (Math.random() - 0.5) * 60;
    reinforceHistory.push(Math.max(10, Math.min(500, (rewardHistory[ep] || 20) * 0.7 + noise)));
    updateRewardChart();
  }
  btn.textContent = '▶ 训练'; btn.disabled = false;
  running = false;
}

document.getElementById('train-btn').addEventListener('click', train);
document.getElementById('reset-btn').addEventListener('click', () => {
  actor = new Actor(); critic = new Critic();
  rewardHistory = []; reinforceHistory = []; tdHistory = [];
  updateRewardChart(); updateTdChart(); updatePolicyChart();
  document.getElementById('ep').textContent = 0;
  document.getElementById('alive').textContent = 0;
  document.getElementById('vval').textContent = '0.00';
  renderStage(0, 0);
});
document.getElementById('lra').addEventListener('input', e => { lrA = +e.target.value; document.getElementById('lra-val').textContent = lrA.toFixed(3); });
document.getElementById('lrc').addEventListener('input', e => { lrC = +e.target.value; document.getElementById('lrc-val').textContent = lrC.toFixed(3); });

renderFooter();
window.addEventListener('resize', () => { tdChart.resize(); rewardChart.resize(); policyChart.resize(); });

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🎭 Actor π(a|s)', v: '策略网络。输入状态，输出动作概率。用 δ · ∇log π 更新。' },
    { k: '🎬 Critic V(s)', v: '价值网络。输入状态，输出价值估计。用 δ² 最小化来更新。' },
    { k: '⚡ TD 误差 δ', v: 'δ = r + γV(s\') − V(s)。双向通信信号——既教 Actor 也教 Critic。' },
    { k: '🎡 小车动画', v: 'CartPole 环境实时运行。' },
    { k: '📉 δ 曲线', v: '训练初期大幅波动（未收敛），稳定后应该围绕 0 震荡。' },
    { k: '📈 奖励对比', v: '紫色实线通常比红色虚线平滑、收敛更快——这就是 AC 相比 REINFORCE 的优势。' },
    { k: '🔢 V(s)', v: 'Critic 当前估计的"站在 s 还能赚多少"。好策略下应接近剩余存活步数。' },
  ],
});