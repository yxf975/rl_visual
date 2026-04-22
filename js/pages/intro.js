// 初探强化学习 · 总论页面
import { renderNav, renderFooter, renderAlgoOverview } from '../page-common.js';

renderNav('intro');
renderAlgoOverview('intro');

// ========== ① 交互循环动画 ==========
const loopAgent = document.getElementById('loop-agent');
const loopEnv = document.getElementById('loop-env');
const arrowTop = document.getElementById('loop-arrow-top');
const arrowBot = document.getElementById('loop-arrow-bottom');
const loopStatus = document.getElementById('loop-status');
const stepCountEl = document.getElementById('loop-step-count');

// 循环阶段：0=观察状态 1=决策动作 2=发送动作 3=环境更新 4=返回奖励与新状态
const PHASES = [
  { hint: '① Agent 观察当前状态 s_t', agent: true, env: false, top: false, bot: false },
  { hint: '② Agent 做出动作决策 a_t', agent: true, env: false, top: false, bot: false },
  { hint: '③ 动作送入环境：Env 收到 a_t', agent: false, env: true, top: true, bot: false },
  { hint: '④ 环境计算新状态和奖励', agent: false, env: true, top: false, bot: false },
  { hint: '⑤ Env 把 s_{t+1} 和 r_t 返回', agent: true, env: false, top: false, bot: true },
];

let phaseIdx = -1;
let stepCount = 0;
let autoTimer = null;

function applyPhase() {
  if (phaseIdx < 0 || phaseIdx >= PHASES.length) {
    loopAgent.classList.remove('active');
    loopEnv.classList.remove('active');
    arrowTop.classList.remove('active');
    arrowBot.classList.remove('active');
    loopStatus.textContent = '准备开始';
    return;
  }
  const p = PHASES[phaseIdx];
  loopAgent.classList.toggle('active', p.agent);
  loopEnv.classList.toggle('active', p.env);
  arrowTop.classList.toggle('active', p.top);
  arrowBot.classList.toggle('active', p.bot);
  loopStatus.textContent = p.hint;
}

function nextPhase() {
  phaseIdx++;
  if (phaseIdx >= PHASES.length) {
    phaseIdx = 0;
    stepCount++;
    stepCountEl.textContent = stepCount;
  }
  applyPhase();
}

document.getElementById('loop-step-btn').addEventListener('click', () => {
  stopAuto();
  nextPhase();
});
document.getElementById('loop-auto-btn').addEventListener('click', (e) => {
  if (autoTimer) {
    stopAuto();
    e.target.textContent = '⏩ 自动循环';
  } else {
    autoTimer = setInterval(nextPhase, 900);
    e.target.textContent = '⏸ 暂停';
  }
});
document.getElementById('loop-reset-btn').addEventListener('click', () => {
  stopAuto();
  phaseIdx = -1; stepCount = 0;
  stepCountEl.textContent = 0;
  applyPhase();
  document.getElementById('loop-auto-btn').textContent = '⏩ 自动循环';
});
function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  document.getElementById('loop-auto-btn').textContent = '⏩ 自动循环';
}

// ========== ② 六要素 ==========
const CONCEPTS = [
  { emoji: '🤖', name: 'Agent 智能体', def: '做决策的主体，它会从环境中感知状态并输出动作。', analogy: '≈ 一个开车的司机' },
  { emoji: '🌍', name: 'Environment 环境', def: '智能体之外的一切。它接收动作，返回奖励和新状态。', analogy: '≈ 道路、交通、车辆构成的外界' },
  { emoji: '📍', name: 'State 状态 s', def: '当前时刻的"处境描述"，是 Agent 做决策的依据。', analogy: '≈ "我现在在红灯前，车速 30km/h"' },
  { emoji: '🎬', name: 'Action 动作 a', def: 'Agent 在某状态下可以采取的操作。', analogy: '≈ 踩刹车 / 打方向盘 / 加油' },
  { emoji: '🏆', name: 'Reward 奖励 r', def: '环境给 Agent 的即时反馈。RL 的全部目标就是累计奖励最大化。', analogy: '≈ 安全到家 +10，闯红灯 -100' },
  { emoji: '🧭', name: 'Policy 策略 π', def: '从状态到动作的映射（或概率分布），是 Agent 的"大脑"。', analogy: '≈ "遇到红灯就停车" 这一行为规则' },
];
document.getElementById('concepts-grid').innerHTML = CONCEPTS.map(c => `
  <div class="concept-card">
    <div class="concept-emoji">${c.emoji}</div>
    <div>
      <div class="concept-name">${c.name}</div>
      <div class="concept-def">${c.def}</div>
      <div class="concept-analogy">💡 ${c.analogy}</div>
    </div>
  </div>
`).join('');

// ========== ④ 应用案例 ==========
const CASES = [
  { emoji: '♟️', title: '下棋 & 游戏', desc: 'AlphaGo、AlphaStar、OpenAI Five 都靠 RL 学习策略', bg1: '#fde68a', bg2: '#fca5a5' },
  { emoji: '🦾', title: '机器人控制', desc: '机械臂抓取、四足机器人行走、无人机飞行控制', bg1: '#dbeafe', bg2: '#e0e7ff' },
  { emoji: '💬', title: '推荐系统', desc: '推荐什么视频/商品？RL 优化长期用户留存和点击率', bg1: '#fbcfe8', bg2: '#fde68a' },
  { emoji: '✨', title: 'LLM 对齐', desc: 'ChatGPT / DeepSeek 的 RLHF / DPO / GRPO 全部基于 RL', bg1: '#e9d5ff', bg2: '#fce7f3' },
];
document.getElementById('cases-grid').innerHTML = CASES.map(c => `
  <div class="case-card" style="--bg1:${c.bg1};--bg2:${c.bg2}">
    <div class="case-emoji">${c.emoji}</div>
    <div class="case-title">${c.title}</div>
    <div class="case-desc">${c.desc}</div>
  </div>
`).join('');

// ========== ⑤ 学习路径 ==========
const ROADMAP = [
  { num: 'P1', title: '🌱 走进 RL', desc: '初探 + 多臂老虎机（你正在这里）', href: 'bandit.html' },
  { num: 'P2', title: '🗺️ 数学语言', desc: 'MDP：描述一切 RL 问题的统一框架', href: 'mdp.html' },
  { num: 'P3', title: '📐 经典求解', desc: 'DP → TD → DQN，从精确到采样再到深度', href: 'dp.html' },
  { num: 'P4', title: '🎭 策略优化', desc: 'REINFORCE → AC → TRPO → PPO → DDPG', href: 'pg.html' },
  { num: 'P5', title: '✨ 大模型对齐', desc: 'RLHF / DPO / GRPO：RL 的前沿应用', href: 'llm.html' },
];
document.getElementById('roadmap').innerHTML = ROADMAP.map(r => `
  <a href="${r.href}" class="roadmap-step">
    <div class="roadmap-num">${r.num}</div>
    <div class="font-bold mt-2 text-gray-800">${r.title}</div>
    <div class="text-xs text-gray-500 mt-1 leading-relaxed">${r.desc}</div>
  </a>
`).join('');

renderFooter();
