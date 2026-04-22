import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('dqn');
renderAlgoOverview('dqn');
mountComicButton(COMICS.dqn);

renderGoalCard(null, {
  what: '这不是一个真实训练，而是一个<b>"DQN 训练循环动画演示"</b>：用流程图 + 模拟数据展示 DQN 的每一步在干什么。',
  goal: '理解 DQN 相比 Q-Learning 多出来的"经验回放池"和"目标网络"这两个关键组件如何协作，在图形化流程中看清数据流动。',
  success: '点击"▶ 播放训练循环"后，你会看到：① 环境产出经验 → ② 存入回放池（格子被填色）→ ③ 采样小批量（橙色高亮）→ ④ 目标网络算 TD 目标 → ⑤ 主网络更新 → ⑥ 每 5 步同步一次目标网络。同时损失下降、奖励上升。',
  metrics: [
    '🧠 <b>亮着的方块</b>：表示当前活跃的组件（环境/回放池/Q 网络/目标网络/损失计算）',
    '📦 <b>回放池格子</b>：灰色=空，紫色=已存经验，橙色=本步采样',
    '📈 <b>曲线图</b>：红色=损失（应下降），绿色=累计奖励（应上升）',
  ],
  note: '这是一个简化演示，真实 DQN 的经验池通常容量 10⁶，这里为了可视化缩到 64 格。',
});

const BUFFER_SIZE = 64;
let buffer = []; // 存入的经验数量
let sampled = []; // 采样到的索引
let lossHistory = [];
let rewardHistory = [];
let step = 0;
let syncCounter = 0;

const bufferBox = document.getElementById('replay-buffer');
function renderBuffer() {
  let html = '';
  for (let i = 0; i < BUFFER_SIZE; i++) {
    const cls = sampled.includes(i) ? 'filled sampled' : (i < buffer.length ? 'filled' : '');
    html += `<span class="replay-slot ${cls}"></span>`;
  }
  bufferBox.innerHTML = html;
}
renderBuffer();

const chart = echarts.init(document.getElementById('train-chart'));
function updateChart() {
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, data: ['损失', '累计奖励'] },
    grid: { top: 30, left: 50, right: 50, bottom: 30 },
    xAxis: { type: 'category', data: lossHistory.map((_, i) => i) },
    yAxis: [{ type: 'value', name: '损失', position: 'left' }, { type: 'value', name: '奖励', position: 'right' }],
    series: [
      { name: '损失', type: 'line', data: lossHistory, yAxisIndex: 0, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' } },
      { name: '累计奖励', type: 'line', data: rewardHistory, yAxisIndex: 1, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' } },
    ],
  });
}
updateChart();

// 流程模块高亮
const moduleIds = ['m-env', 'm-buf', 'm-loss', 'm-q', 'm-tgt'];
const flowIds = ['a1', 'a2', 'a3', 'a4', 'a5'];

function highlight(id) {
  moduleIds.forEach(m => document.getElementById(m)?.classList.remove('active'));
  if (id) document.getElementById(id)?.classList.add('active');
}
function flowing(...ids) {
  flowIds.forEach(a => document.getElementById(a)?.classList.remove('flowing'));
  ids.forEach(id => document.getElementById(id)?.classList.add('flowing'));
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let running = false;
async function runLoop() {
  if (running) return;
  running = true;
  const btn = document.getElementById('run-btn');
  btn.textContent = '⏸ 演示中...'; btn.disabled = true;

  for (let i = 0; i < 40; i++) {
    // 阶段 1：环境交互
    highlight('m-env'); flowing('a1');
    await sleep(700);
    // 阶段 2：存入经验池
    highlight('m-buf');
    if (buffer.length < BUFFER_SIZE) buffer.push(step);
    else buffer.shift(), buffer.push(step);
    sampled = [];
    renderBuffer();
    await sleep(600);

    // 阶段 3：采样
    flowing('a3');
    if (buffer.length >= 8) {
      sampled = [];
      while (sampled.length < 8) {
        const idx = Math.floor(Math.random() * Math.min(buffer.length, BUFFER_SIZE));
        if (!sampled.includes(idx)) sampled.push(idx);
      }
      renderBuffer();
    }
    await sleep(800);

    // 阶段 4：目标计算 → 损失
    highlight('m-tgt'); flowing();
    await sleep(500);
    highlight('m-loss'); flowing('a5');
    // 模拟损失递减 + 奖励递增
    const noise = (Math.random() - 0.5) * 0.3;
    const loss = Math.max(0.05, 2.0 * Math.exp(-step / 20) + noise);
    const reward = Math.min(200, 20 + step * 4 + noise * 10);
    lossHistory.push(+loss.toFixed(3));
    rewardHistory.push(+reward.toFixed(1));
    updateChart();
    await sleep(600);

    // 阶段 5：更新 Q 网络
    highlight('m-q'); flowing();
    await sleep(600);

    // 阶段 6：同步目标网络（每 5 步）
    syncCounter++;
    if (syncCounter >= 5) {
      flowing('a4');
      highlight('m-tgt');
      await sleep(900);
      syncCounter = 0;
    }
    highlight(); flowing();
    step++;
    await sleep(250);
  }
  btn.textContent = '▶ 播放训练循环'; btn.disabled = false;
  running = false;
}

document.getElementById('run-btn').addEventListener('click', runLoop);
document.getElementById('reset-btn').addEventListener('click', () => {
  if (running) return;
  buffer = []; sampled = []; lossHistory = []; rewardHistory = []; step = 0; syncCounter = 0;
  renderBuffer(); updateChart(); highlight(); flowing();
});

renderFooter();
window.addEventListener('resize', () => chart.resize());

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🌍 环境', v: '智能体与之交互的世界。每步产出 (s, a, r, s\') 四元组。' },
    { k: '📦 经验回放池', v: '存储历史经验的缓冲区。灰色=空槽，紫色=已存数据。' },
    { k: '🟠 橙色格子', v: '本步从回放池中随机采样的 8 条经验（mini-batch）。' },
    { k: '🧠 Q 网络', v: '主网络，估计 Q(s,a)。每步都会用 SGD 更新。' },
    { k: '👯 目标网络', v: '主网络的"慢速副本"，提供稳定的 TD 目标。每 5 步同步一次。' },
    { k: '⚡ 损失计算', v: 'L = (r + γ·max Q_target(s\',a\') − Q(s,a))² 的 mini-batch 平均。' },
    { k: '📉 红色曲线', v: '损失。训练初期高，随着学习不断下降。' },
    { k: '📈 绿色曲线', v: '累计奖励。训练初期低，学习后稳步上升。' },
  ],
});
