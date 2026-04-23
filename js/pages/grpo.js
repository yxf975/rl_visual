import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';

renderNav('grpo');
renderAlgoOverview('grpo');

renderGoalCard(null, {
  goal: '理解 GRPO 如何用组内归一化替代 Critic，以及它在 DeepSeek-R1 推理训练中的威力。',
  success: '看到 PPO 和 GRPO 显存条的直观差异；反复点"重新采样"能看到 A_i 有正有负、均值约 0、总和约 0；R1-Zero 曲线看到准确率和长度同步爬升。',
  metrics: [
    '💾 <b>显存条</b>：4 条 vs 3 条，Critic 这一条被省掉',
    '🟢 <b>组内正优势</b>：该回答被加强（概率↑）',
    '🔴 <b>组内负优势</b>：该回答被削弱（概率↓）',
    '📈 <b>R1-Zero 曲线</b>：准确率和响应长度同步上升 —— Aha Moment 涌现',
    '📋 <b>对比表</b>：GRPO 的核心创新是优势估计方式',
  ],
});

// ===== 组内归一化演示 =====
const advChart = echarts.init(document.getElementById('advantage-chart'));

function sampleGroup(n) {
  // 模拟 N 个回答的 RM 打分，分布在 [1, 10]
  const scores = Array.from({ length: n }, () => +(1 + Math.random() * 9).toFixed(2));
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  const std = Math.sqrt(variance);
  const advs = scores.map(s => +((s - mean) / (std + 1e-8)).toFixed(2));
  return { scores, mean, std, advs };
}

function renderGroup() {
  const n = parseInt(document.getElementById('gsize').value, 10);
  const { scores, mean, std, advs } = sampleGroup(n);
  const colCount = n <= 4 ? n : Math.min(6, n);
  const box = document.getElementById('grpo-demo');
  box.innerHTML = `
    <div class="text-sm mb-3 bg-gray-50 rounded p-3"><b>📝 Prompt：</b>"请简要介绍一下强化学习的核心思想。"</div>
    <div class="grid gap-2" style="grid-template-columns:repeat(${colCount}, minmax(0, 1fr))">
      ${scores.map((s, i) => `
        <div class="ans-tile ${advs[i] >= 0 ? 'positive' : 'negative'} rounded-lg p-3 text-center">
          <div class="text-xs text-gray-500">回答 ${i + 1}</div>
          <div class="text-xl font-bold mt-1" style="color:${advs[i] >= 0 ? '#059669' : '#dc2626'}">${s.toFixed(2)}</div>
          <div class="text-xs mt-1 text-gray-500">RM 分</div>
          <div class="mt-2 text-sm font-bold" style="color:${advs[i] >= 0 ? '#059669' : '#dc2626'}">A = ${advs[i] >= 0 ? '+' : ''}${advs[i]}</div>
          <div class="text-xs text-gray-400 mt-1">${advs[i] >= 0 ? '↑ 增强' : '↓ 削弱'}</div>
        </div>
      `).join('')}
    </div>
    <div class="mt-4 flex flex-wrap gap-3 text-sm bg-brand-50 rounded p-3">
      <div>组内均值 μ = <b class="text-brand-600">${mean.toFixed(3)}</b></div>
      <div>组内标准差 σ = <b class="text-brand-600">${std.toFixed(3)}</b></div>
      <div>优势之和 ΣA ≈ <b class="text-brand-600">${advs.reduce((a, b) => a + b, 0).toFixed(2)}</b></div>
      <div class="text-xs text-gray-500 self-center">👆 优势之和理论上为 0（均值归一化）</div>
    </div>
  `;

  advChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, data: ['RM 分数', '优势 A_i'] },
    grid: { top: 36, left: 48, right: 48, bottom: 30 },
    xAxis: { type: 'category', data: scores.map((_, i) => `回答${i + 1}`) },
    yAxis: [
      { type: 'value', name: 'RM 分', position: 'left' },
      { type: 'value', name: '优势 A', position: 'right' },
    ],
    series: [
      {
        name: 'RM 分数', type: 'bar', data: scores,
        itemStyle: { color: '#a78bfa' },
        markLine: { data: [{ type: 'average', name: '均值', label: { formatter: 'μ' } }], lineStyle: { color: '#f59e0b' } },
      },
      {
        name: '优势 A_i', type: 'bar', yAxisIndex: 1,
        data: advs.map(a => ({ value: a, itemStyle: { color: a >= 0 ? '#10b981' : '#ef4444' } })),
      },
    ],
  });
}

document.getElementById('grpo-gen').addEventListener('click', renderGroup);
document.getElementById('gsize').addEventListener('input', e => {
  document.getElementById('gsize-val').textContent = e.target.value;
  renderGroup();
});
renderGroup();

// ===== R1-Zero 训练曲线 =====
const r1Chart = echarts.init(document.getElementById('r1-chart'));
(function drawR1() {
  const N = 100;
  const accuracy = [], length = [], reward = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    // 准确率：S 曲线从 20 到 85
    accuracy.push(+(20 + 65 / (1 + Math.exp(-10 * (t - 0.45))) + (Math.random() - 0.5) * 3).toFixed(1));
    // 响应长度：平滑上升，前期慢后期快
    length.push(+(200 + 1800 * Math.pow(t, 1.8) + (Math.random() - 0.5) * 50).toFixed(0));
    // 训练奖励
    reward.push(+(0.1 + 0.85 * (1 - Math.exp(-t * 2.8)) + (Math.random() - 0.5) * 0.04).toFixed(3));
  }
  r1Chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 36, left: 60, right: 60, bottom: 36 },
    xAxis: { type: 'category', data: Array.from({ length: N }, (_, i) => i * 10), name: '训练步（×10）' },
    yAxis: [
      { type: 'value', name: '准确率 / 奖励', position: 'left', max: 100 },
      { type: 'value', name: '响应长度（token）', position: 'right' },
    ],
    series: [
      { name: '数学题准确率 (%)', type: 'line', data: accuracy, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' }, lineStyle: { width: 3 } },
      { name: '平均响应长度', type: 'line', data: length, yAxisIndex: 1, smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' } },
      { name: 'GRPO 奖励 (×100)', type: 'line', data: reward.map(r => +(r * 100).toFixed(1)), smooth: true, showSymbol: false, itemStyle: { color: '#8b5cf6' }, lineStyle: { type: 'dashed' } },
    ],
  });
})();

window.addEventListener('resize', () => {
  advChart.resize();
  r1Chart.resize();
});

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '💾 PPO 4 条', v: '策略 π、参考 π_ref、Critic V、奖励 RM —— 70B 场景下显存爆炸。' },
    { k: '💾 GRPO 3 条', v: '去掉 Critic，70B 场景下少 140GB 显存。可验证任务里还可再去 RM。' },
    { k: '🎲 组采样', v: '对同一 prompt 一次采 N 个回答（通常 N=8 或 16）。' },
    { k: '📐 A_i 公式', v: '(r_i − μ) / σ：组内均值做基线、标准差做自动缩放。' },
    { k: '🟢 正优势', v: '比组内平均好 → PPO 式的 ratio × advantage 会让该回答概率↑。' },
    { k: '🔴 负优势', v: '比组内平均差 → 该回答的概率被削弱。' },
    { k: '📈 R1-Zero 曲线', v: '准确率和响应长度同步上升——模型自发学会"先想想"。' },
    { k: '💡 Aha Moment', v: 'R1-Zero 某步开始出现 "Wait, let me reconsider..."——自涌现的反思能力。' },
  ],
});
