import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('ppo');
renderAlgoOverview('ppo');
mountComicButton(COMICS.ppo);

renderGoalCard(null, {
  what: '一个<b>PPO 裁剪目标函数的数学可视化</b>。横轴是概率比 r = π_new/π_old，纵轴是目标函数值。你可以改变优势 A 和裁剪系数 ε，实时看 PPO 的行为。',
  goal: '理解 PPO 的核心公式 L^CLIP = min( r·A, clip(r, 1-ε, 1+ε)·A ) 为什么能"稳住"策略更新——它在超过安全区间时会把梯度截断为 0。',
  success: '拖动 A 为正，把 r 想象超过 1+ε：绿色曲线（PPO 最终目标）会变平（dL/dr = 0），意味着此时不再鼓励继续增大 r。这就是 PPO 的"软约束"作用。',
  metrics: [
    '🔴 <b>红色虚线</b>：原始目标 r·A（如果不裁剪会怎样）',
    '🟡 <b>黄色虚线</b>：裁剪后目标 clip(r,1-ε,1+ε)·A',
    '🟢 <b>绿色粗线</b>：PPO 真正用的 min(两者)—— 注意它在边界外被"压平"',
    '🟣 <b>紫色点线</b>：r=1-ε 和 r=1+ε 的安全区间边界',
  ],
  note: '下方"三算法对比"图展示 REINFORCE/TRPO/PPO 在同一任务上的收敛速度差异。',
});

let A = 1.0;
let eps = 0.2;

const clipChart = echarts.init(document.getElementById('clip-chart'));
const compareChart = echarts.init(document.getElementById('compare-chart'));

function updateClipChart() {
  // 概率比从 0 到 2
  const rVals = [];
  const origVals = [];
  const clippedVals = [];
  const finalVals = [];
  for (let r = 0; r <= 2.01; r += 0.02) {
    rVals.push(+r.toFixed(2));
    const orig = r * A;
    const clipped = Math.max(1 - eps, Math.min(1 + eps, r)) * A;
    const final = A >= 0 ? Math.min(orig, clipped) : Math.max(orig, clipped);
    origVals.push(+orig.toFixed(3));
    clippedVals.push(+clipped.toFixed(3));
    finalVals.push(+final.toFixed(3));
  }
  clipChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, data: ['原始 r·A', '裁剪 clip·A', 'PPO 最终 L^CLIP'] },
    grid: { top: 40, left: 50, right: 30, bottom: 40 },
    xAxis: { type: 'category', data: rVals, name: '概率比 r = π_new/π_old', axisLabel: { interval: 25 } },
    yAxis: { type: 'value', name: '目标值' },
    series: [
      { name: '原始 r·A', type: 'line', data: origVals, showSymbol: false, lineStyle: { type: 'dashed', color: '#ef4444' } },
      { name: '裁剪 clip·A', type: 'line', data: clippedVals, showSymbol: false, lineStyle: { type: 'dashed', color: '#f59e0b' } },
      { name: 'PPO 最终 L^CLIP', type: 'line', data: finalVals, showSymbol: false, lineStyle: { width: 3, color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.15)' } },
    ],
    markLine: { silent: true, symbol: 'none', data: [
      { xAxis: Math.round((1 - eps) * 50), lineStyle: { color: '#8b5cf6', type: 'dotted' }, label: { formatter: `1-ε` } },
      { xAxis: Math.round((1 + eps) * 50), lineStyle: { color: '#8b5cf6', type: 'dotted' }, label: { formatter: `1+ε` } },
      { xAxis: 50, lineStyle: { color: '#6b7280' }, label: { formatter: 'r=1' } },
    ] },
  });
}

function updateCompareChart() {
  // 模拟三种算法的训练曲线
  const N = 100;
  const rein = [], trpo = [], ppo = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    rein.push(50 + 300 * (1 - Math.exp(-t * 1.5)) + (Math.random() - 0.5) * 120);
    trpo.push(50 + 380 * (1 - Math.exp(-t * 2)) + (Math.random() - 0.5) * 40);
    ppo.push(50 + 400 * (1 - Math.exp(-t * 2.5)) + (Math.random() - 0.5) * 25);
  }
  compareChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({ length: N }, (_, i) => i), name: '回合' },
    yAxis: { type: 'value', name: '奖励' },
    series: [
      { name: 'REINFORCE', type: 'line', data: rein, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' } },
      { name: 'TRPO', type: 'line', data: trpo, smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' } },
      { name: 'PPO', type: 'line', data: ppo, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' }, lineStyle: { width: 3 } },
    ],
  });
}

function updateRange() {
  document.getElementById('range-val').textContent = `[${(1 - eps).toFixed(2)}, ${(1 + eps).toFixed(2)}]`;
}

document.getElementById('adv').addEventListener('input', e => {
  A = +e.target.value;
  document.getElementById('adv-val').textContent = (A >= 0 ? '+' : '') + A.toFixed(1);
  updateClipChart();
});
document.getElementById('eps').addEventListener('input', e => {
  eps = +e.target.value;
  document.getElementById('eps-val').textContent = eps.toFixed(2);
  updateRange();
  updateClipChart();
});

updateClipChart();
updateCompareChart();
updateRange();
renderFooter();
window.addEventListener('resize', () => { clipChart.resize(); compareChart.resize(); });

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '横轴 r', v: '概率比 r = π_new(a|s) / π_old(a|s)。r=1 表示策略未变；r>1 表示想增大该动作概率。' },
    { k: '纵轴', v: '目标函数值，越大越好（PPO 想最大化它）。' },
    { k: '🔴 原始 r·A', v: '未裁剪的梯度目标。会鼓励无限增大 r（当 A>0），容易崩溃。' },
    { k: '🟡 裁剪 clip·A', v: '强制把 r 限制在 [1-ε, 1+ε]。但光用它会在边界外继续鼓励偏离 1。' },
    { k: '🟢 PPO 最终', v: 'min(两者)。当 A>0 且 r 超出 1+ε 时取裁剪值（变平），梯度归零 —— 策略不会再偏离。' },
    { k: '🎚️ 优势 A', v: '正 → 想增大该动作概率；负 → 想减小。' },
    { k: '🎚️ ε 裁剪', v: '安全区间的半宽度。常用 0.2，即允许概率比在 [0.8, 1.2] 内自由变化。' },
  ],
});
