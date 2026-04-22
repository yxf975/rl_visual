import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('llm');
renderAlgoOverview('llm');
mountComicButton(COMICS.llm);

renderGoalCard(null, {
  what: '这是一个<b>对齐算法的多视角演示</b>面板。上面 4 个 Tab 分别展示：RLHF 流程图、PPO 训练曲线、DPO 对比、GRPO 组内归一化、四法雷达对比。',
  goal: '理解 ChatGPT / Claude / DeepSeek 这类大模型是<b>如何被"训得懂人话"</b>的。不同方法在"稳定性/效率/简易度/效果"上各有取舍。',
  success: '点击"▶ 播放 RLHF 流程"看数据如何在 π / π_ref / V / RM / PPO 五个模块间流动；切 Tab 看 PPO 奖励上升 + KL 同步上升；看 DPO 的 chosen/rejected logprob 发散；看 GRPO 的组内归一化产生的正负优势。',
  metrics: [
    '🎭 <b>流程图节点</b>：高亮说明当前活跃模块',
    '🟡 <b>黄色小球</b>：数据/奖励信号在模块间流动',
    '📈 <b>PPO 双 Y 轴</b>：绿线是 RM 奖励（应升），橙线是 KL（应缓升）',
    '📊 <b>DPO 曲线</b>：chosen（绿）向上 + rejected（红）向下，中间差距越来越大',
    '🎯 <b>雷达图</b>：各方法的 6 维综合能力对比',
  ],
  note: '这里展示的是<b>理论曲线</b>（为了清晰）。真实训练中这些曲线会更嘈杂，但总体趋势一致。',
});

// ===== Tab 切换 =====
document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));
    document.getElementById('pane-' + btn.dataset.tab).classList.remove('hidden');
    // 懒渲染图表
    if (btn.dataset.tab === 'ppo-llm') renderPPOLLM();
    if (btn.dataset.tab === 'dpo') renderDPO();
    if (btn.dataset.tab === 'compare') renderRadar();
  });
});

// ===== RLHF 流程图 =====
const flowCanvas = document.getElementById('rlhf-flow');
const fctx = flowCanvas.getContext('2d');
const FW = flowCanvas.width, FH = flowCanvas.height;

const models = [
  { name: 'π (策略)', emoji: '🎭', x: FW * 0.12, y: FH * 0.5, color: '#ec4899' },
  { name: 'π_ref (参考)', emoji: '📖', x: FW * 0.38, y: FH * 0.2, color: '#f59e0b' },
  { name: 'V (Critic)', emoji: '🎬', x: FW * 0.38, y: FH * 0.8, color: '#0ea5e9' },
  { name: 'RM (奖励)', emoji: '⚖️', x: FW * 0.65, y: FH * 0.5, color: '#10b981' },
  { name: 'PPO 更新', emoji: '🔧', x: FW * 0.88, y: FH * 0.5, color: '#8b5cf6' },
];

let highlightIdx = -1;
let tokenPos = null; // 数据流点的位置

function renderRLHFFlow() {
  fctx.clearRect(0, 0, FW, FH);
  // 连线
  const connections = [[0, 3], [3, 4], [4, 0], [0, 1], [0, 2]];
  fctx.strokeStyle = '#c4b5fd';
  fctx.lineWidth = 2;
  connections.forEach(([a, b]) => {
    fctx.beginPath();
    fctx.moveTo(models[a].x, models[a].y);
    fctx.lineTo(models[b].x, models[b].y);
    fctx.stroke();
  });
  // 节点
  models.forEach((m, i) => {
    fctx.beginPath();
    fctx.arc(m.x, m.y, highlightIdx === i ? 50 : 42, 0, Math.PI * 2);
    fctx.fillStyle = highlightIdx === i ? m.color : '#fff';
    fctx.fill();
    fctx.lineWidth = 3;
    fctx.strokeStyle = m.color;
    fctx.stroke();
    fctx.font = '30px sans-serif';
    fctx.textAlign = 'center';
    fctx.fillStyle = highlightIdx === i ? '#fff' : m.color;
    fctx.fillText(m.emoji, m.x, m.y + 10);
    fctx.font = 'bold 12px sans-serif';
    fctx.fillStyle = '#1f2937';
    fctx.fillText(m.name, m.x, m.y + 65);
  });
  // 数据流点
  if (tokenPos) {
    fctx.beginPath();
    fctx.arc(tokenPos.x, tokenPos.y, 12, 0, Math.PI * 2);
    fctx.fillStyle = '#fbbf24';
    fctx.fill();
    fctx.fillStyle = '#000';
    fctx.font = 'bold 14px sans-serif';
    fctx.fillText(tokenPos.label || '📨', tokenPos.x, tokenPos.y + 5);
  }
}
renderRLHFFlow();

async function animateToken(fromIdx, toIdx, label) {
  const from = models[fromIdx], to = models[toIdx];
  const steps = 25;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    tokenPos = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, label };
    renderRLHFFlow();
    await new Promise(r => setTimeout(r, 70));
  }
  tokenPos = null;
}

async function playRLHF() {
  const btn = document.getElementById('rlhf-play');
  btn.disabled = true; btn.textContent = '▶ 播放中...';
  for (let round = 0; round < 3; round++) {
    // π → RM
    highlightIdx = 0; renderRLHFFlow();
    await animateToken(0, 3, '📨');
    highlightIdx = 3; renderRLHFFlow();
    await new Promise(r => setTimeout(r, 400));
    // RM → PPO (奖励信号)
    await animateToken(3, 4, '🏆');
    highlightIdx = 4; renderRLHFFlow();
    await new Promise(r => setTimeout(r, 300));
    // PPO → π
    await animateToken(4, 0, '⬆');
    highlightIdx = 0;
    renderRLHFFlow();
    await new Promise(r => setTimeout(r, 300));
  }
  highlightIdx = -1; renderRLHFFlow();
  btn.disabled = false; btn.textContent = '▶ 播放 RLHF 流程';
}
document.getElementById('rlhf-play').addEventListener('click', playRLHF);

// ===== PPO in LLM 图表 =====
let ppoLlmRendered = false;
function renderPPOLLM() {
  if (ppoLlmRendered) return;
  ppoLlmRendered = true;
  const chart = echarts.init(document.getElementById('ppo-llm-chart'));
  const N = 100;
  const reward = [], kl = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    reward.push(+(2 + 7 * (1 - Math.exp(-t * 2)) + (Math.random() - 0.5) * 0.6).toFixed(2));
    kl.push(+(0.1 + t * 2 + (Math.random() - 0.5) * 0.3).toFixed(2));
  }
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 50, right: 50, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({length: N}, (_,i) => i), name: 'PPO 训练步' },
    yAxis: [{ type: 'value', name: 'RM 奖励', position: 'left' }, { type: 'value', name: 'KL 散度', position: 'right' }],
    series: [
      { name: 'RM 平均分', type: 'line', data: reward, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' } },
      { name: 'KL(π ‖ π_SFT)', type: 'line', data: kl, yAxisIndex: 1, smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' } },
    ],
  });
  window.addEventListener('resize', () => chart.resize());
}

// ===== DPO 图表 =====
let dpoRendered = false;
function renderDPO() {
  if (dpoRendered) return;
  dpoRendered = true;
  const chart = echarts.init(document.getElementById('dpo-chart'));
  const N = 80;
  const chosen = [], rejected = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    chosen.push(+(-1.5 + 2.5 * t + (Math.random() - 0.5) * 0.3).toFixed(2));
    rejected.push(+(-1 - 2 * t + (Math.random() - 0.5) * 0.3).toFixed(2));
  }
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({length:N}, (_,i)=>i), name: 'DPO 训练步' },
    yAxis: { type: 'value', name: 'log π(y|x) − log π_ref(y|x)' },
    series: [
      { name: 'chosen（被选中回答）', type: 'line', data: chosen, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.1)' } },
      { name: 'rejected（被拒绝回答）', type: 'line', data: rejected, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' }, areaStyle: { color: 'rgba(239,68,68,0.1)' } },
    ],
  });
  window.addEventListener('resize', () => chart.resize());
}

// ===== GRPO 演示 =====
document.getElementById('grpo-gen').addEventListener('click', () => {
  const scores = Array.from({ length: 6 }, () => +(Math.random() * 10).toFixed(2));
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const std = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length);
  const advs = scores.map(s => +((s - mean) / (std + 1e-8)).toFixed(2));
  const box = document.getElementById('grpo-demo');
  box.innerHTML = `
    <div class="text-sm mb-3"><b>📝 Prompt：</b>"介绍一下强化学习"</div>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
      ${scores.map((s, i) => `
        <div class="text-center p-2 rounded-lg border-2" style="border-color:${advs[i] >= 0 ? '#10b981' : '#ef4444'};background:${advs[i] >= 0 ? '#dcfce7' : '#fee2e2'}">
          <div class="text-xs font-bold">回答 ${i + 1}</div>
          <div class="text-xl font-bold mt-1" style="color:${advs[i] >= 0 ? '#059669' : '#dc2626'}">${s}</div>
          <div class="text-xs mt-1 text-gray-500">RM 分数</div>
          <div class="mt-2 text-xs"><b>A=${advs[i]}</b></div>
        </div>
      `).join('')}
    </div>
    <div class="text-sm space-y-1 bg-brand-50 rounded p-3">
      <div>组内均值 μ = <b class="text-brand-600">${mean.toFixed(3)}</b></div>
      <div>组内标准差 σ = <b class="text-brand-600">${std.toFixed(3)}</b></div>
      <div class="mt-2">优势 A_i = (r_i - μ) / σ</div>
      <div class="text-xs text-gray-500 mt-2">✅ 正优势 → 增加该回答概率；❌ 负优势 → 降低</div>
    </div>
  `;
});

// ===== 四法雷达对比 =====
let radarRendered = false;
function renderRadar() {
  if (radarRendered) return;
  radarRendered = true;
  const chart = echarts.init(document.getElementById('radar-chart'));
  chart.setOption({
    legend: { top: 0 },
    radar: {
      indicator: [
        { name: '训练稳定性', max: 10 },
        { name: '数据效率', max: 10 },
        { name: '实现简易度', max: 10 },
        { name: '效果上限', max: 10 },
        { name: '计算成本（反向）', max: 10 },
        { name: '社区流行度', max: 10 },
      ],
      shape: 'polygon',
      splitArea: { areaStyle: { color: ['#f5f3ff', '#ede9fe'] } },
    },
    series: [{
      type: 'radar',
      data: [
        { name: 'REINFORCE', value: [3, 3, 9, 4, 8, 3], itemStyle: { color: '#ef4444' } },
        { name: 'RLHF-PPO', value: [6, 6, 4, 9, 3, 10], itemStyle: { color: '#f59e0b' } },
        { name: 'DPO', value: [8, 8, 9, 7, 8, 8], itemStyle: { color: '#10b981' } },
        { name: 'GRPO', value: [8, 7, 7, 9, 6, 8], itemStyle: { color: '#8b5cf6' } },
      ],
    }],
  });
  window.addEventListener('resize', () => chart.resize());
}

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🎭 π (策略)', v: '正在训练的大模型（Actor）。这就是你最终要部署的模型。' },
    { k: '📖 π_ref (参考)', v: 'SFT 阶段冻结的模型。用来算 KL 惩罚，防止策略"走太远"。' },
    { k: '🎬 V (Critic)', v: '状态价值网络。只有 PPO 需要它；DPO/GRPO 都省掉了。' },
    { k: '⚖️ RM (奖励)', v: '用人类偏好数据预训练的打分器。给生成回答打分。DPO 跳过了这一步。' },
    { k: '🔧 PPO 更新', v: 'PPO 算法用奖励和 KL 惩罚更新 π。需要 4 个大模型同时存在，显存爆炸。' },
    { k: '🟡 黄色小球', v: '数据/奖励信号在模块间流动的可视化。' },
    { k: 'PPO Tab', v: '展示训练时 RM 奖励（绿色）和 KL 散度（橙色）的典型曲线。' },
    { k: 'DPO Tab', v: 'log π − log π_ref 的变化：chosen 上升 / rejected 下降，即 π 相对于 π_ref 偏向 chosen。' },
    { k: 'GRPO Tab', v: '对同一 prompt 生成一组回答，用组内归一化算优势 A_i。省掉 Critic 网络。' },
    { k: '雷达 Tab', v: '四种对齐方法在稳定性、效率、简易度、效果、成本、流行度 6 维上的对比。' },
  ],
});
