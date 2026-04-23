import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';

renderNav('dpo');
renderAlgoOverview('dpo');

renderGoalCard(null, {
  goal: '看懂 DPO 为什么能跳过 RM：5 步推导 + logprob 演化 + 成本对比。',
  success: '完成 5 步推导动画后能复述"log Z 在差值中消去"这一关键；滑动 β 看 chosen/rejected logprob 的偏离速率随 β 变化；理解 DPO 只需 2 个模型。',
  metrics: [
    '🧮 <b>第 4 步</b>：log Z(x) 在差值中消去（为什么不需要 RM 的核心）',
    '🎁 <b>隐式奖励</b>：r̂(x,y) = β·log(π/π_ref)',
    '📉 <b>chosen 曲线</b>：β 小 → 快速上升；β 大 → 缓慢上升',
    '📈 <b>rejected 曲线</b>：β 小 → 快速下降；β 大 → 缓慢下降',
    '💰 <b>显存条</b>：DPO 约为 RLHF 的一半',
  ],
});

// ===== 5 步推导动画 =====
const TOTAL_STEPS = 5;
let currentStep = 1;
const list = document.querySelectorAll('.derive-step');
function setStep(s) {
  currentStep = Math.min(TOTAL_STEPS, Math.max(1, s));
  list.forEach(el => {
    const idx = +el.dataset.idx;
    if (idx <= currentStep) el.classList.add('active');
    else el.classList.remove('active');
  });
  document.getElementById('derive-step-val').textContent = currentStep;
}
setStep(1);
document.getElementById('derive-prev').addEventListener('click', () => setStep(currentStep - 1));
document.getElementById('derive-next').addEventListener('click', () => setStep(currentStep + 1));
document.getElementById('derive-reset').addEventListener('click', () => setStep(1));

let playing = false;
document.getElementById('derive-play').addEventListener('click', async () => {
  if (playing) return;
  playing = true;
  const btn = document.getElementById('derive-play');
  btn.disabled = true;
  setStep(1);
  for (let i = 2; i <= TOTAL_STEPS; i++) {
    await new Promise(r => setTimeout(r, 1400));
    setStep(i);
  }
  btn.disabled = false;
  playing = false;
});

// ===== logprob 演化曲线 =====
const dpoChart = echarts.init(document.getElementById('dpo-chart'));
function computeDpoCurves(beta) {
  const N = 80;
  const chosen = [], rejected = [];
  // 速率与 β 成反比（β 大 → 曲线平缓）
  const rate = 1 / (0.15 + beta * 2);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    chosen.push(+(-1.0 + 2.6 * (1 - Math.exp(-t * rate)) + (Math.random() - 0.5) * 0.18).toFixed(2));
    rejected.push(+(-0.8 - 2.2 * (1 - Math.exp(-t * rate)) + (Math.random() - 0.5) * 0.18).toFixed(2));
  }
  return { chosen, rejected };
}
function drawDpo(beta) {
  const { chosen, rejected } = computeDpoCurves(beta);
  dpoChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 36, left: 60, right: 20, bottom: 36 },
    xAxis: { type: 'category', data: Array.from({ length: chosen.length }, (_, i) => i), name: '训练步' },
    yAxis: { type: 'value', name: 'log π − log π_ref' },
    series: [
      { name: 'chosen（y_w）', type: 'line', data: chosen, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.12)' } },
      { name: 'rejected（y_l）', type: 'line', data: rejected, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' }, areaStyle: { color: 'rgba(239,68,68,0.12)' } },
    ],
  });
}
drawDpo(0.1);
document.getElementById('beta').addEventListener('input', e => {
  const b = parseFloat(e.target.value);
  document.getElementById('beta-val').textContent = b.toFixed(2);
  drawDpo(b);
});
window.addEventListener('resize', () => dpoChart.resize());

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '1️⃣ RLHF 目标', v: '这是要最大化的原始目标：最大化 RM 奖励 − β·KL 惩罚。' },
    { k: '2️⃣ 闭式最优', v: '拉格朗日乘数法解出 π* 的闭式形式：π_ref × 指数化奖励。' },
    { k: '3️⃣ 反解 r', v: '把 π* 的等式两边取 log 反解出 r(x,y) 的表达式——关键魔法准备中。' },
    { k: '4️⃣ log Z 消去', v: '代入 Bradley-Terry，r(y_w) − r(y_l) 中 log Z(x) 两项相减为 0！' },
    { k: '5️⃣ DPO Loss', v: '得到最终损失：用 π 和 π_ref 就能端到端训练，RM/Critic 全省。' },
    { k: '🎁 隐式奖励', v: 'r̂ = β·log(π/π_ref) —— DPO 没有显式 RM，但自己就是一个打分器。' },
    { k: '📊 β 的作用', v: 'β 大 → 紧贴 π_ref 保守；β 小 → 激进偏移，可能崩溃。工业界常用 0.1 ~ 0.5。' },
    { k: '💰 2 模型 vs 4 模型', v: 'DPO 只需策略 π 和冻结的 π_ref，显存减半，速度也翻倍。' },
  ],
});
