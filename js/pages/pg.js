import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('reinforce');
renderAlgoOverview('reinforce');
mountComicButton(COMICS.reinforce);

renderGoalCard(null, {
  what: '<b>CartPole 倒立摆</b>：一个经典 RL 环境。小车上立着一根可以自由旋转的杆，智能体可以左推（动作 0）或右推（动作 1）小车。',
  goal: '让杆子<b>尽可能久地不倒</b>。每存活一步 +1 奖励。杆角度超过 ±12° 或小车跑出边界就判输。目标是让每回合存活 500 步（环境上限）。',
  success: '训练初期杆子很快就倒了（只存活 10-30 步）。随着策略网学到"杆左倾就左推/杆右倾就右推"的对应关系，存活时间稳步上升。100 回合左右能学到相当好的策略。',
  metrics: [
    '🎡 <b>小车动画</b>：实时展示当前策略的表现。杆子越稳说明策略越好。',
    '📊 <b>动作概率图</b>：策略 π(a|s) 当前的决策分布。训练中会随状态变化。',
    '📈 <b>累计奖励曲线</b>：每回合存活步数。整体应呈上升趋势。',
    '📉 <b>梯度方差曲线</b>：勾选 "加入 Baseline" 能看到方差显著下降。',
  ],
  note: '试试勾选/不勾选"加入 Baseline"对比两条方差曲线——这是 REINFORCE 最重要的改进点。',
});

// 简化版 CartPole 模拟：状态 = 角度 θ，动作 = 左推/右推
// 模拟用简化物理；策略用 softmax 以状态特征为输入
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
    const gravity = 9.8, massCart = 1.0, massPole = 0.1;
    const totalMass = massCart + massPole;
    const length = 0.5, poleMassLength = massPole * length;
    const dt = 0.02;

    const cos = Math.cos(this.theta), sin = Math.sin(this.theta);
    const temp = (force + poleMassLength * this.thetaDot ** 2 * sin) / totalMass;
    const thetaAcc = (gravity * sin - cos * temp) / (length * (4/3 - massPole * cos * cos / totalMass));
    const xAcc = temp - poleMassLength * thetaAcc * cos / totalMass;

    this.x += dt * this.xDot;
    this.xDot += dt * xAcc;
    this.theta += dt * this.thetaDot;
    this.thetaDot += dt * thetaAcc;

    const done = Math.abs(this.theta) > 0.21 || Math.abs(this.x) > 2.4;
    this.done = done;
    return { state: this.getState(), reward: 1, done };
  }
}

// 线性策略：π(a=1|s) = sigmoid(θ·s)
class LinearPolicy {
  constructor() { this.w = Array(4).fill(0).map(() => (Math.random() - 0.5) * 0.1); }
  prob1(s) {
    const z = s.reduce((acc, v, i) => acc + v * this.w[i], 0);
    return 1 / (1 + Math.exp(-z));
  }
  sample(s) {
    const p = this.prob1(s);
    return Math.random() < p ? 1 : 0;
  }
  gradLogPi(s, a) {
    const p = this.prob1(s);
    const err = a - p;
    return s.map(v => v * err);
  }
}

let policy = new LinearPolicy();
let rewardHistory = [];
let lastProbs = [0.5, 0.5];
let gradVarsWith = [], gradVarsWithout = [];
let useBaseline = false;
let running = false;

const stage = document.getElementById('cart-stage');
// 渲染车 + 杆
function renderStage(x, theta) {
  const W = stage.clientWidth || 400;
  const centerX = W / 2;
  const cartLeft = centerX + x * 80 - 30;
  stage.innerHTML = `
    <div class="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-200 to-amber-400"></div>
    <div class="cart" style="left:${cartLeft}px"></div>
    <div class="pole" style="left:${cartLeft + 27}px;transform:rotate(${theta}rad)"></div>
  `;
}
renderStage(0, 0);

// 图表
const policyChart = echarts.init(document.getElementById('policy-chart'));
const rewardChart = echarts.init(document.getElementById('reward-chart'));
const varChart = echarts.init(document.getElementById('var-chart'));

function updatePolicyChart() {
  policyChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 30, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['← 左推', '→ 右推'] },
    yAxis: { type: 'value', max: 1 },
    series: [{ type: 'bar', data: lastProbs, itemStyle: { color: p => '#8b5cf6' }, label: { show: true, position: 'top', formatter: p => p.data.toFixed(2) } }],
  });
}
function updateRewardChart() {
  rewardChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: rewardHistory.map((_, i) => i + 1), name: '回合' },
    yAxis: { type: 'value', name: '存活步数' },
    series: [{ type: 'line', data: rewardHistory, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.15)' } }],
  });
}
function updateVarChart() {
  varChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({ length: Math.max(gradVarsWith.length, gradVarsWithout.length) }, (_, i) => i + 1) },
    yAxis: { type: 'log', name: '梯度方差', min: 0.01 },
    series: [
      { name: '无 Baseline', type: 'line', data: gradVarsWithout, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' } },
      { name: '有 Baseline', type: 'line', data: gradVarsWith, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' } },
    ],
  });
}
updatePolicyChart(); updateRewardChart(); updateVarChart();

async function runEpisode() {
  const env = new CartPole();
  let s = env.reset();
  const traj = [];
  for (let t = 0; t < 500; t++) {
    const a = policy.sample(s);
    const { state, reward, done } = env.step(a);
    traj.push({ s, a, r: reward });
    renderStage(env.x, env.theta);
    document.getElementById('stp').textContent = t + 1;
    document.getElementById('alive').textContent = traj.length;
    lastProbs = [1 - policy.prob1(s), policy.prob1(s)];
    if (t % 5 === 0) updatePolicyChart();
    s = state;
    await new Promise(r => setTimeout(r, 15));
    if (done) break;
  }
  return traj;
}

async function train() {
  if (running) return;
  running = true;
  const btn = document.getElementById('train-btn');
  btn.textContent = '⏳ 训练中...'; btn.disabled = true;
  const EPISODES = 60;
  const GAMMA = 0.99, LR = 0.01;

  for (let ep = 0; ep < EPISODES; ep++) {
    document.getElementById('ep').textContent = ep + 1;
    const traj = await runEpisode();
    // 计算回报
    const G = Array(traj.length).fill(0);
    let acc = 0;
    for (let t = traj.length - 1; t >= 0; t--) { acc = traj[t].r + GAMMA * acc; G[t] = acc; }
    const baseline = useBaseline ? G.reduce((a, b) => a + b, 0) / G.length : 0;

    // 计算梯度 + 方差
    let gradSum = Array(4).fill(0);
    let gradsList = []; // 用于计算方差
    for (let t = 0; t < traj.length; t++) {
      const adv = G[t] - baseline;
      const g = policy.gradLogPi(traj[t].s, traj[t].a).map(v => v * adv);
      gradsList.push(g);
      for (let k = 0; k < 4; k++) gradSum[k] += g[k];
    }
    // 更新
    for (let k = 0; k < 4; k++) policy.w[k] += LR * gradSum[k] / traj.length;

    // 计算方差（第一维）
    const mean = gradsList.reduce((a, g) => a + g[0], 0) / gradsList.length;
    const vari = gradsList.reduce((a, g) => a + (g[0] - mean) ** 2, 0) / gradsList.length;

    rewardHistory.push(traj.length);
    if (useBaseline) gradVarsWith.push(+vari.toFixed(4));
    else gradVarsWithout.push(+vari.toFixed(4));

    updateRewardChart(); updateVarChart();
  }

  btn.textContent = '▶ 训练 100 回合'; btn.disabled = false;
  running = false;
}

document.getElementById('train-btn').addEventListener('click', train);
document.getElementById('reset-btn').addEventListener('click', () => {
  policy = new LinearPolicy();
  rewardHistory = []; gradVarsWith = []; gradVarsWithout = [];
  updateRewardChart(); updateVarChart(); updatePolicyChart();
  document.getElementById('ep').textContent = 0;
  document.getElementById('stp').textContent = 0;
  document.getElementById('alive').textContent = 0;
  renderStage(0, 0);
});
document.getElementById('baseline').addEventListener('change', e => { useBaseline = e.target.checked; });

renderFooter();
window.addEventListener('resize', () => { policyChart.resize(); rewardChart.resize(); varChart.resize(); });

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🚗 灰色方块', v: '小车。可以左右移动（x 位置 ∈ [-2.4, 2.4]），超出范围就结束。' },
    { k: '🟨 金色杆', v: '倒立摆。重力会让它倒，你要推小车来维持平衡。角度 |θ| > 12° 就结束。' },
    { k: '📊 动作概率', v: '策略 π 在当前状态下选"左推"还是"右推"的概率。训练后会变得尖锐（接近 0 或 1）。' },
    { k: '📈 存活步数', v: '每回合能撑多少步。初始 10-30 步，训练后可达 500 步（环境上限）。' },
    { k: '📉 梯度方差', v: 'REINFORCE 的核心痛点。红线（无 baseline）通常比绿线（有 baseline）高 10-100 倍。' },
    { k: '📦 Baseline 复选', v: '勾选后用平均回报 G̅ 作为 baseline，减去它能大幅降低方差。' },
  ],
});
