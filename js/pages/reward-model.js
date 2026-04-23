import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';

renderNav('reward-model');
renderAlgoOverview('reward-model');

renderGoalCard(null, {
  goal: '亲手体验 RM 的三件事：① 偏好对如何变成 Pairwise Loss；② 训练过程中 chosen/rejected 分布如何分离；③ RM Hacking 是如何发生的。',
  success: '标注 6 对偏好后看 loss 从 0.7 → 接近 0；滑动训练步数看两组分布逐渐拉开；看 RM 分数持续上涨但真实偏好曲线先升后降。',
  metrics: [
    '📉 <b>Pairwise Loss</b>：每标一对应立即下降一点',
    '📏 <b>margin = r_w − r_l</b>：越正越好，理想情况 &gt; 2',
    '📊 <b>分数分布</b>：chosen 右移、rejected 左移、中间重叠区变窄',
    '🐛 <b>Hacking 曲线</b>：RM 分一直涨，但"真实满意度"出现拐点',
  ],
});

// ========== 实验 1：Pairwise 标注 ==========
const PAIRS = [
  {
    prompt: '什么是光合作用？',
    a: { id: 'a1', text: '光合作用是植物利用光能将二氧化碳和水转化为葡萄糖并释放氧气的过程。', quality: 'good' },
    b: { id: 'a2', text: '光合作用就是植物变魔法，树叶绿绿的，很神奇！', quality: 'bad' },
  },
  {
    prompt: '请推荐一本讲机器学习的书。',
    a: { id: 'b1', text: '可以看《统计学习方法》（李航），讲解经典 ML 算法很系统。入门建议搭配吴恩达 coursera 课程。', quality: 'good' },
    b: { id: 'b2', text: '随便看一本就行啦。', quality: 'bad' },
  },
  {
    prompt: '怎么煮溏心蛋？',
    a: { id: 'c1', text: '随便煮一下，看着不透了就差不多。', quality: 'bad' },
    b: { id: 'c2', text: '冷水下锅大火烧开后转小火煮 6 分半钟，立即过冰水 2 分钟，剥壳即可得到半熟溏心蛋。', quality: 'good' },
  },
  {
    prompt: '用 Python 读取 JSON 文件怎么写？',
    a: { id: 'd1', text: 'import json\nwith open("data.json") as f:\n    data = json.load(f)', quality: 'good' },
    b: { id: 'd2', text: '你自己去查文档吧。', quality: 'bad' },
  },
  {
    prompt: '什么是梯度下降？',
    a: { id: 'e1', text: '就是一直往下走。', quality: 'bad' },
    b: { id: 'e2', text: '梯度下降是一种优化算法：沿目标函数梯度的反方向迭代更新参数，以最小化损失函数。步长由学习率控制。', quality: 'good' },
  },
  {
    prompt: '推荐一个北京周末去的地方。',
    a: { id: 'f1', text: '可以去颐和园或香山，秋季红叶特别美；想看展可以去国博或 UCCA。', quality: 'good' },
    b: { id: 'f2', text: '北京很大你自己选吧。', quality: 'bad' },
  },
];

const pairState = {
  labeled: 0,
  losses: [],     // [{t, loss}]
  margins: [],    // [{t, margin}]
  currentLoss: Math.log(2), // ≈ 0.693
  currentMargin: 0,
};
const pairLossChart = echarts.init(document.getElementById('pair-loss-chart'));
const pairMarginChart = echarts.init(document.getElementById('pair-margin-chart'));
function drawPairCharts() {
  pairLossChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: pairState.losses.map(d => d.t), name: '标注步' },
    yAxis: { type: 'value', name: 'L', min: 0, max: 0.8 },
    series: [{
      type: 'line', data: pairState.losses.map(d => d.loss.toFixed(3)),
      smooth: true, itemStyle: { color: '#ef4444' },
      areaStyle: { color: 'rgba(239,68,68,0.15)' },
    }],
  });
  pairMarginChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: pairState.margins.map(d => d.t), name: '标注步' },
    yAxis: { type: 'value', name: 'r_w − r_l' },
    series: [{
      type: 'line', data: pairState.margins.map(d => d.margin.toFixed(2)),
      smooth: true, itemStyle: { color: '#10b981' },
      areaStyle: { color: 'rgba(16,185,129,0.15)' },
    }],
  });
}
drawPairCharts();

function renderPairs() {
  const stage = document.getElementById('pair-stage');
  stage.innerHTML = PAIRS.map((p, idx) => `
    <div class="bg-white rounded-xl p-4 border border-gray-200" data-pair="${idx}">
      <div class="text-xs text-gray-500 mb-2">🎯 第 ${idx + 1} 对 · Prompt：<b class="text-gray-700">${p.prompt}</b></div>
      <div class="grid md:grid-cols-2 gap-3">
        <div class="pair-card rounded-lg p-3 cursor-pointer" data-pair="${idx}" data-ans="a">
          <div class="text-xs font-bold text-gray-600 mb-1">回答 A</div>
          <p class="text-sm whitespace-pre-wrap">${p.a.text}</p>
        </div>
        <div class="pair-card rounded-lg p-3 cursor-pointer" data-pair="${idx}" data-ans="b">
          <div class="text-xs font-bold text-gray-600 mb-1">回答 B</div>
          <p class="text-sm whitespace-pre-wrap">${p.b.text}</p>
        </div>
      </div>
      <div class="text-xs text-gray-500 mt-2">👆 点击你认为更好的那一个（chosen），另一个自动成为 rejected。</div>
    </div>
  `).join('');

  stage.querySelectorAll('.pair-card').forEach(card => {
    card.addEventListener('click', () => {
      const pairIdx = +card.dataset.pair;
      const ans = card.dataset.ans;
      const row = stage.querySelector(`[data-pair="${pairIdx}"]`);
      // 避免重复标注
      if (row.querySelector('.pair-card.chosen')) return;
      // 标注两张卡
      row.querySelectorAll('.pair-card').forEach(c => {
        if (c.dataset.ans === ans) c.classList.add('chosen');
        else c.classList.add('rejected');
      });
      // 更新 loss / margin
      // 正确标注 → margin 上升 0.6~1.2；错误标注（选了 quality=bad 的）→ margin 上升慢甚至小幅下降
      const pair = PAIRS[pairIdx];
      const chosenQuality = pair[ans].quality;
      const increment = chosenQuality === 'good'
        ? (0.7 + Math.random() * 0.5)
        : (Math.random() * 0.2 - 0.05);
      pairState.currentMargin += increment;
      pairState.currentLoss = Math.log(1 + Math.exp(-pairState.currentMargin));
      pairState.labeled += 1;
      pairState.losses.push({ t: pairState.labeled, loss: pairState.currentLoss });
      pairState.margins.push({ t: pairState.labeled, margin: pairState.currentMargin });
      document.getElementById('pair-count').textContent = pairState.labeled;
      drawPairCharts();
    });
  });
}
renderPairs();
document.getElementById('pair-reset').addEventListener('click', () => {
  pairState.labeled = 0;
  pairState.losses = [];
  pairState.margins = [];
  pairState.currentLoss = Math.log(2);
  pairState.currentMargin = 0;
  document.getElementById('pair-count').textContent = '0';
  drawPairCharts();
  renderPairs();
});

// ========== 实验 2：分数分布 ==========
const distChart = echarts.init(document.getElementById('dist-chart'));
// 固定两批回答的"理想分数"种子
const N_SAMPLES = 60;
const seeds = Array.from({ length: N_SAMPLES * 2 }, (_, i) => Math.sin(i * 13.37) * 0.5 + Math.cos(i * 7.77) * 0.3);
function buildDist(step) {
  // step ∈ 0..100
  // chosen 均值 0 → 3，rejected 均值 0 → -3；std 2 → 1.2
  const progress = step / 100;
  const muW = progress * 3.0;
  const muL = -progress * 3.0;
  const sigma = 2 - progress * 0.8;
  const w = seeds.slice(0, N_SAMPLES).map(s => muW + s * sigma * 0.9);
  const l = seeds.slice(N_SAMPLES).map(s => muL + s * sigma * 0.9);
  return { w, l, muW, muL };
}
function histogram(values, bins, min, max) {
  const width = (max - min) / bins;
  const counts = new Array(bins).fill(0);
  values.forEach(v => {
    const idx = Math.max(0, Math.min(bins - 1, Math.floor((v - min) / width)));
    counts[idx] += 1;
  });
  const xs = Array.from({ length: bins }, (_, i) => +(min + width * (i + 0.5)).toFixed(2));
  return { xs, counts };
}
function drawDist(step) {
  const { w, l, muW, muL } = buildDist(step);
  const binMin = -6, binMax = 6, binN = 24;
  const hw = histogram(w, binN, binMin, binMax);
  const hl = histogram(l, binN, binMin, binMax);
  distChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0, data: ['chosen', 'rejected'] },
    grid: { top: 36, left: 50, right: 20, bottom: 36 },
    xAxis: { type: 'category', data: hw.xs, name: 'RM 打分' },
    yAxis: { type: 'value', name: '频数' },
    series: [
      { name: 'chosen', type: 'bar', data: hw.counts, itemStyle: { color: 'rgba(16,185,129,0.7)' }, barGap: '-100%' },
      { name: 'rejected', type: 'bar', data: hl.counts, itemStyle: { color: 'rgba(239,68,68,0.55)' } },
    ],
  });
  document.getElementById('mean-w').textContent = muW.toFixed(2);
  document.getElementById('mean-l').textContent = muL.toFixed(2);
  document.getElementById('margin').textContent = (muW - muL).toFixed(2);
}
drawDist(0);
document.getElementById('train-step').addEventListener('input', e => {
  const s = +e.target.value;
  document.getElementById('step-val').textContent = s;
  drawDist(s);
});

// ========== 实验 3：RM Hacking ==========
const hackChart = echarts.init(document.getElementById('hacking-chart'));
(function drawHacking() {
  const N = 60;
  const rmScore = [], humanScore = [], length = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    // RM 打分单调上升
    rmScore.push(+(2 + 7 * (1 - Math.exp(-t * 2.2)) + (Math.random() - 0.5) * 0.25).toFixed(2));
    // 人类真实满意度：先升后降，拐点约 0.45
    const peak = -((t - 0.45) ** 2) * 18 + 6.5;
    humanScore.push(+(Math.max(1, peak) + (Math.random() - 0.5) * 0.3).toFixed(2));
    // 平均回答长度爆炸
    length.push(+(80 + t * 900 + (Math.random() - 0.5) * 20).toFixed(0));
  }
  hackChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 36, left: 50, right: 60, bottom: 36 },
    xAxis: { type: 'category', data: Array.from({ length: N }, (_, i) => i), name: '训练步' },
    yAxis: [
      { type: 'value', name: '分数', position: 'left', min: 0, max: 10 },
      { type: 'value', name: '回答长度', position: 'right' },
    ],
    series: [
      { name: 'RM 打分（↑越来越高）', type: 'line', data: rmScore, smooth: true, showSymbol: false, itemStyle: { color: '#10b981' } },
      { name: '人类真实满意度（拐点！）', type: 'line', data: humanScore, smooth: true, showSymbol: false, itemStyle: { color: '#ef4444' }, lineStyle: { width: 3 } },
      { name: '平均回答长度（字符）', type: 'line', data: length, yAxisIndex: 1, smooth: true, showSymbol: false, itemStyle: { color: '#f59e0b' }, lineStyle: { type: 'dashed' } },
    ],
  });
})();

window.addEventListener('resize', () => {
  pairLossChart.resize();
  pairMarginChart.resize();
  distChart.resize();
  hackChart.resize();
});

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🧪 实验 1 · Pairwise', v: '每点击一对 (chosen, rejected)，等价于训练 RM 一步：让 r_w − r_l 变大。' },
    { k: '📉 Pairwise Loss', v: 'L = −log σ(r_w − r_l)。初始约 0.693，margin 越大 loss 越接近 0。' },
    { k: '⚠️ 错误标注', v: '如果你选了明显差的回答当 chosen，margin 增长会变慢甚至回退——就像给 RM 灌了脏数据。' },
    { k: '🧪 实验 2 · 分布演化', v: '训练步数越多，chosen 分布右移、rejected 左移，重叠区越来越窄。' },
    { k: '🐛 RM Hacking', v: 'RM 打分持续上涨但人类真实满意度先升后降。典型特征是回答长度/格式化爆炸。' },
    { k: '📏 Goodhart\'s Law', v: '"当指标变成目标，它就不再是好指标。"——RM 被过度优化时的经典现象。' },
  ],
});
