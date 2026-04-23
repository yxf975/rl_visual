import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';

renderNav('align-compare');
renderAlgoOverview('align-compare');

renderGoalCard(null, {
  goal: '看懂 RLHF-PPO / DPO / GRPO 三种对齐方法在 6 个维度上的定位差异，并学会用决策树在实际项目里做选型。',
  success: '看雷达图能说出每种方法最突出的 2 个维度；走通决策树三步能给出推荐；场景卡里能对号入座找到自己的项目。',
  metrics: [
    '📡 <b>雷达图</b>：RLHF 效果最高但成本最高；DPO 简易度最高；GRPO 均衡且成本中等',
    '📋 <b>对比表</b>：10 个维度详细铺开，找到最在乎的那一列',
    '🌳 <b>决策树</b>：3 个问题决定选哪个',
    '🎯 <b>场景卡</b>：6 个典型业务一键对号',
  ],
});

// ===== 雷达图 =====
const radarChart = echarts.init(document.getElementById('radar-chart'));
radarChart.setOption({
  tooltip: {},
  legend: { top: 0, data: ['RLHF-PPO', 'DPO', 'GRPO', 'REINFORCE (参考)'] },
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
      { name: 'RLHF-PPO', value: [6, 6, 4, 9, 3, 10], itemStyle: { color: '#f59e0b' }, areaStyle: { color: 'rgba(245,158,11,0.25)' } },
      { name: 'DPO',       value: [8, 8, 9, 7, 8, 8],  itemStyle: { color: '#10b981' }, areaStyle: { color: 'rgba(16,185,129,0.22)' } },
      { name: 'GRPO',      value: [8, 7, 7, 9, 6, 8],  itemStyle: { color: '#8b5cf6' }, areaStyle: { color: 'rgba(139,92,246,0.22)' } },
      { name: 'REINFORCE (参考)', value: [3, 3, 9, 4, 8, 3], itemStyle: { color: '#ef4444' }, lineStyle: { type: 'dashed' } },
    ],
  }],
});
window.addEventListener('resize', () => radarChart.resize());

renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '📡 雷达图', v: '四种方法在 6 个维度上的综合画像。看形状就能判断取舍。' },
    { k: '📋 对比表', v: '细化到 10 项差异。实战选型时可以直接把这张表当 checklist。' },
    { k: '🌳 决策树', v: '从"奖励能否规则化" → "算力预算" → "数据形态"三步走，对应 GRPO/PPO/DPO。' },
    { k: '🎯 场景卡', v: '6 个典型业务场景直接给出推荐，覆盖大部分真实项目。' },
    { k: '🚀 前沿方向', v: 'RLAIF、KTO、ORPO、PRM —— 对齐领域仍在快速演进，这些是值得关注的近年工作。' },
  ],
});
