import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('rlhf');
renderAlgoOverview('rlhf');
// 整篇 LLM 对齐系列共用一组漫画，挂在首页 RLHF
if (COMICS.llm) mountComicButton(COMICS.llm);

renderGoalCard(null, {
  goal: '理解 RLHF 三阶段（SFT / RM / PPO）各自在做什么，以及 PPO 阶段四个模型（π / π_ref / V / RM）如何协同。',
  success: '点击"▶ 播放 PPO 对齐过程"看数据在 5 个模块间流动；调 β 看 RM 奖励和 KL 散度的权衡曲线；看三段回答的 RM 分数和 KL 惩罚如何综合得到最终奖励。',
  metrics: [
    '🎭 <b>流程图节点高亮</b>：当前正在参与计算的模型',
    '🟡 <b>黄色小球</b>：prompt / 回答 / 奖励 / 梯度 在模块间流动',
    '💾 <b>显存条</b>：直观感受"四模型同框"的代价',
    '📈 <b>β 权衡曲线</b>：β↑ → RM 奖励↓、KL↓（更保守）',
    '💬 <b>三答案打分</b>：高分并非一定选，KL 惩罚会拉低激进回答',
  ],
});

// ===== 流程图 =====
const flowCanvas = document.getElementById('rlhf-flow');
const fctx = flowCanvas.getContext('2d');
const FW = flowCanvas.width, FH = flowCanvas.height;

const models = [
  { name: 'Prompt', emoji: '📨', x: FW * 0.08, y: FH * 0.5, color: '#64748b' },
  { name: 'π (策略)', emoji: '🎭', x: FW * 0.28, y: FH * 0.5, color: '#ec4899' },
  { name: 'π_ref (参考)', emoji: '📖', x: FW * 0.50, y: FH * 0.2, color: '#f59e0b' },
  { name: 'V (Critic)', emoji: '🎬', x: FW * 0.50, y: FH * 0.8, color: '#0ea5e9' },
  { name: 'RM (奖励)', emoji: '⚖️', x: FW * 0.72, y: FH * 0.5, color: '#10b981' },
  { name: 'PPO 更新', emoji: '🔧', x: FW * 0.92, y: FH * 0.5, color: '#8b5cf6' },
];

let highlightIdx = -1;
let tokenPos = null;

function renderFlow() {
  fctx.clearRect(0, 0, FW, FH);
  const connections = [[0, 1], [1, 2], [1, 3], [1, 4], [4, 5], [2, 5], [3, 5], [5, 1]];
  fctx.strokeStyle = '#c4b5fd';
  fctx.lineWidth = 2;
  connections.forEach(([a, b]) => {
    fctx.beginPath();
    fctx.moveTo(models[a].x, models[a].y);
    fctx.lineTo(models[b].x, models[b].y);
    fctx.stroke();
  });
  models.forEach((m, i) => {
    fctx.beginPath();
    fctx.arc(m.x, m.y, highlightIdx === i ? 42 : 36, 0, Math.PI * 2);
    fctx.fillStyle = highlightIdx === i ? m.color : '#fff';
    fctx.fill();
    fctx.lineWidth = 3;
    fctx.strokeStyle = m.color;
    fctx.stroke();
    fctx.font = '26px sans-serif';
    fctx.textAlign = 'center';
    fctx.fillStyle = highlightIdx === i ? '#fff' : m.color;
    fctx.fillText(m.emoji, m.x, m.y + 8);
    fctx.font = 'bold 11px sans-serif';
    fctx.fillStyle = '#1f2937';
    fctx.fillText(m.name, m.x, m.y + 58);
  });
  if (tokenPos) {
    fctx.beginPath();
    fctx.arc(tokenPos.x, tokenPos.y, 14, 0, Math.PI * 2);
    fctx.fillStyle = '#fbbf24';
    fctx.fill();
    fctx.fillStyle = '#000';
    fctx.font = 'bold 14px sans-serif';
    fctx.fillText(tokenPos.label || '📨', tokenPos.x, tokenPos.y + 5);
  }
}
renderFlow();

async function animateToken(fromIdx, toIdx, label) {
  const from = models[fromIdx], to = models[toIdx];
  const steps = 22;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    tokenPos = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, label };
    renderFlow();
    await new Promise(r => setTimeout(r, 55));
  }
  tokenPos = null;
}

let playing = false;
async function play() {
  if (playing) return;
  playing = true;
  const btn = document.getElementById('rlhf-play');
  btn.disabled = true; btn.textContent = '▶ 播放中...';
  for (let round = 0; round < 3; round++) {
    // prompt → π
    highlightIdx = 0; renderFlow();
    await animateToken(0, 1, '📨');
    highlightIdx = 1; renderFlow();
    await new Promise(r => setTimeout(r, 250));
    // π 并行发给 π_ref / V / RM
    await Promise.all([
      animateToken(1, 2, '📝'),
      animateToken(1, 3, '📝'),
      animateToken(1, 4, '📝'),
    ]);
    highlightIdx = 4; renderFlow();
    await new Promise(r => setTimeout(r, 200));
    // RM → PPO 奖励
    await animateToken(4, 5, '🏆');
    // π_ref → PPO KL
    await animateToken(2, 5, '📏');
    // V → PPO 优势
    await animateToken(3, 5, '📊');
    highlightIdx = 5; renderFlow();
    await new Promise(r => setTimeout(r, 250));
    // PPO → π 更新
    await animateToken(5, 1, '⬆');
    highlightIdx = 1; renderFlow();
    await new Promise(r => setTimeout(r, 200));
  }
  highlightIdx = -1; renderFlow();
  btn.disabled = false; btn.textContent = '▶ 播放 PPO 对齐过程';
  playing = false;
}
document.getElementById('rlhf-play').addEventListener('click', play);
document.getElementById('rlhf-reset').addEventListener('click', () => {
  if (playing) return;
  highlightIdx = -1; tokenPos = null; renderFlow();
});

// ===== β 权衡曲线 =====
const klChart = echarts.init(document.getElementById('kl-reward-chart'));
function computeCurves(beta) {
  const N = 80;
  const rewards = [], kls = [], net = [];
  // 简化模型：RM 奖励随训练步数上升但会饱和；KL 以 1/beta 的速率上升然后被压制
  for (let i = 0; i < N; i++) {
    const t = i / N;
    // KL 上升速率和 β 成反比：β 小 → KL 上升得飞快
    const klGrowth = (1 / (0.1 + beta));
    const kl = 0.1 + (1 - Math.exp(-t * klGrowth * 0.8)) * (2 + 6 / (0.5 + beta * 10));
    // RM 奖励：越大 β 越拖累奖励上升
    const rawReward = 2 + 7 * (1 - Math.exp(-t * 2));
    const reward = rawReward - beta * kl * 0.6;
    rewards.push(+reward.toFixed(2));
    kls.push(+kl.toFixed(2));
    net.push(+(reward - beta * kl).toFixed(2));
  }
  return { rewards, kls, net };
}
function drawBetaChart(beta) {
  const { rewards, kls, net } = computeCurves(beta);
  klChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 36, left: 50, right: 50, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({ length: rewards.length }, (_, i) => i), name: '训练步' },
    yAxis: [
      { type: 'value', name: 'RM 奖励 / 净奖励', position: 'left' },
      { type: 'value', name: 'KL 散度', position: 'right' },
    ],
    series: [
      { name: 'RM 奖励', type: 'line', data: rewards, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' } },
      { name: '净奖励 = RM − β·KL', type: 'line', data: net, smooth: true, showSymbol: false, itemStyle: { color: '#8b5cf6' }, lineStyle: { type: 'dashed' } },
      { name: 'KL(π ‖ π_SFT)', type: 'line', data: kls, yAxisIndex: 1, smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' } },
    ],
  });
}
function updateBetaHint(beta) {
  let hint = '';
  if (beta < 0.05) hint = '⚠️ β 太小 → KL 爆炸 → 策略胡言乱语';
  else if (beta < 0.15) hint = '✅ 常用范围，兼顾效果与稳定';
  else if (beta < 0.3) hint = '🛡️ 偏保守，紧贴 π_SFT 风格';
  else hint = '🚫 β 过大 → 策略几乎没变化，学不到偏好';
  document.getElementById('beta-hint').textContent = hint;
}
const betaSlider = document.getElementById('beta');
betaSlider.addEventListener('input', e => {
  const b = parseFloat(e.target.value);
  document.getElementById('beta-val').textContent = b.toFixed(2);
  drawBetaChart(b);
  updateBetaHint(b);
});
drawBetaChart(0.1);
updateBetaHint(0.1);
window.addEventListener('resize', () => klChart.resize());

// ===== 三答案打分演示 =====
const answers = [
  { tone: 'low',  text: 'AI 就是机器人大脑，有时候会乱说话也挺搞笑的。', rm: 2.1, kl: 0.8 },
  { tone: 'mid',  text: '人工智能是让机器模拟人类思维的技术。', rm: 5.3, kl: 0.3 },
  { tone: 'high', text: '人工智能（AI）是研究如何让机器具备学习、推理和决策等类人智能的科学技术。', rm: 8.7, kl: 0.5 },
  { tone: 'hack', text: '好的好的好的！人工智能非常非常非常好！非常重要！非常厉害！', rm: 9.2, kl: 3.5 },
];
function renderAnswerCards(beta) {
  const bgByTone = { low: '#fef2f2', mid: '#fef3c7', high: '#dcfce7', hack: '#fee2e2' };
  const textByTone = { low: '回答 A（低分）', mid: '回答 B（中分）', high: '回答 C（高分）', hack: '回答 D（RM Hacking 风格）' };
  const colorByTone = { low: '#dc2626', mid: '#ca8a04', high: '#16a34a', hack: '#be123c' };
  const root = document.getElementById('answer-cards');
  root.className = 'grid md:grid-cols-4 gap-3';
  root.innerHTML = answers.map(a => {
    const net = (a.rm - beta * a.kl).toFixed(2);
    return `
      <div class="panel" style="background:${bgByTone[a.tone]};">
        <div class="text-xs font-bold mb-1" style="color:${colorByTone[a.tone]}">${textByTone[a.tone]}</div>
        <p class="text-xs leading-relaxed">${a.text}</p>
        <div class="flex items-center gap-2 mt-2 text-xs flex-wrap">
          <span>🎯 RM：</span><b>${a.rm}</b>
          <span>📏 KL：</span><b>${a.kl}</b>
        </div>
        <div class="mt-2 text-xs">
          <b>净奖励 =</b> <span style="color:${colorByTone[a.tone]};font-weight:700">${net}</span>
          <span class="text-gray-500">（= ${a.rm} − ${beta.toFixed(2)}×${a.kl}）</span>
        </div>
      </div>
    `;
  }).join('');
}
renderAnswerCards(0.1);
betaSlider.addEventListener('input', e => renderAnswerCards(parseFloat(e.target.value)));

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🎭 π (策略)', v: '正在训练的大模型（Actor）。最终部署的就是它。' },
    { k: '📖 π_ref (参考)', v: 'SFT 阶段冻结的模型。用来算 KL 惩罚，防止策略"走太远"。' },
    { k: '🎬 V (Critic)', v: '状态价值网络。大模型场景下要再加一个 7B/70B 网络，显存压力巨大。' },
    { k: '⚖️ RM (奖励)', v: '用人类偏好数据预训练的打分器。给生成回答打分。下一章专讲。' },
    { k: '🔧 PPO 更新', v: 'PPO 算法用奖励和 KL 惩罚更新 π。四个大模型同时存在，显存爆炸。' },
    { k: '🟡 黄色小球', v: '数据 / 奖励 / 梯度 在模块间流动的可视化。' },
    { k: 'β 权衡曲线', v: 'β 小 → KL 涨得快 → 可能崩；β 大 → RM 奖励上升慢 → 几乎不学。' },
    { k: '回答 D', v: '典型 RM Hacking：RM 给高分（因为堆叠礼貌词），但 KL 爆炸，净奖励反而最低。' },
  ],
});
