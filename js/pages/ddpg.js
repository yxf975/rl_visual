import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderScenePicker, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('ddpg');
renderAlgoOverview('ddpg');
mountComicButton(COMICS.ddpg);

renderGoalCard(null, {
  goal: '让智能体尽快靠近 🎯 目标。每步奖励 = −距离/100（越近奖励越大）。当距离 &lt; 25 像素时本回合结束。',
  success: '训练初期智能体东倒西歪。学习后 Actor μ(s) 会输出指向目标的方向，轨迹变成"直线追踪"。累计奖励从 -100+ 上升到接近 -10。',
  metrics: [
    '🤖 <b>智能体位置</b>：每回合随机初始化',
    '🎯 <b>红色目标</b>：每回合随机初始化（移动模式下会飘动）',
    '🟣 <b>紫色轨迹</b>：最近 40 步的运动轨迹',
    '🟠 <b>粉色虚圈</b>：探索噪声半径',
    '⬛ <b>黑色方块</b>：障碍物模式下才出现',
    '📈 <b>累计奖励曲线</b>：稳步上升（接近 0）说明收敛',
  ],
});

// 场景定义
const DDPG_SCENES = {
  static: {
    name: '静止目标追踪', desc: '目标位置固定，最简单的连续控制',
    moveTarget: false, hasObstacle: false,
  },
  moving: {
    name: '移动目标拦截', desc: '目标会缓慢移动，策略要"预判"',
    moveTarget: true, hasObstacle: false,
  },
  obstacle: {
    name: '障碍穿越', desc: '中间有墙，要学会绕行',
    moveTarget: false, hasObstacle: true,
  },
};
let currentScene = 'static';
let SCN = DDPG_SCENES[currentScene];

// 2D 目标追踪环境
// 状态 s = [dx, dy] （智能体到目标的相对位置）
// 动作 a ∈ [-1,1]² 代表施加的力
// 奖励 = -|s|（距离越近越好）

const canvas = document.getElementById('track');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let agent = { x: W * 0.2, y: H * 0.5, vx: 0, vy: 0 };
let target = { x: W * 0.7, y: H * 0.5, vx: 0, vy: 0 };
let obstacle = { x: W * 0.5, y: H * 0.5, w: 60, h: 160 }; // 中间的墙
let trail = [];

// 简化 Actor：线性 + tanh
class Actor {
  constructor() { this.W = [[Math.random() * 0.1, 0], [0, Math.random() * 0.1]]; this.b = [0, 0]; }
  act(s) {
    return [
      Math.tanh(this.W[0][0] * s[0] + this.W[0][1] * s[1] + this.b[0]),
      Math.tanh(this.W[1][0] * s[0] + this.W[1][1] * s[1] + this.b[1]),
    ];
  }
  copyTo(tgt, tau = 1) {
    for (let i = 0; i < 2; i++) { for (let j = 0; j < 2; j++) tgt.W[i][j] = tau * this.W[i][j] + (1-tau) * tgt.W[i][j]; tgt.b[i] = tau * this.b[i] + (1-tau) * tgt.b[i]; }
  }
}
// 简化 Critic：Q(s,a) = -|s|²·(1 - a·s_dir) 的近似，我们用梯度直接向着目标方向
class Critic {
  Q(s, a) {
    // 假定好动作 = 指向目标（-s 方向），a 与 -s 点积越大 Q 越高
    const norm = Math.hypot(s[0], s[1]) + 1e-6;
    const dir = [-s[0] / norm, -s[1] / norm];
    return a[0] * dir[0] + a[1] * dir[1] - norm * 0.01;
  }
}

let actor = new Actor(), targetActor = new Actor();
actor.copyTo(targetActor);
let critic = new Critic();

let sigma = 0.3, tau = 0.005;
let running = false;
let rewards = [];

const rewardChart = echarts.init(document.getElementById('reward-chart'));
function updateChart() {
  rewardChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: rewards.map((_, i) => i + 1) },
    yAxis: { type: 'value', name: '累计奖励' },
    series: [{ type: 'line', data: rewards, smooth: true, showSymbol: false, itemStyle: { color: '#8b5cf6' }, areaStyle: { color: 'rgba(139,92,246,0.15)' } }],
  });
}
updateChart();

function render() {
  ctx.clearRect(0, 0, W, H);
  // 障碍物
  if (SCN.hasObstacle) {
    ctx.fillStyle = '#374151';
    ctx.fillRect(obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x - obstacle.w / 2, obstacle.y - obstacle.h / 2, obstacle.w, obstacle.h);
  }
  // 目标
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(target.x, target.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '28px sans-serif';
  ctx.fillText('🎯', target.x - 14, target.y + 10);
  // 移动目标时画一个 hint
  if (SCN.moveTarget) {
    ctx.strokeStyle = 'rgba(239,68,68,0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(target.x, target.y, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // 轨迹
  if (trail.length > 1) {
    ctx.strokeStyle = 'rgba(139,92,246,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    trail.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.stroke();
  }
  // 智能体
  ctx.font = '32px sans-serif';
  ctx.fillText('🤖', agent.x - 16, agent.y + 10);
  // 噪声圈
  ctx.strokeStyle = 'rgba(236,72,153,0.4)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, 30 * sigma, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function hitObstacle(x, y) {
  if (!SCN.hasObstacle) return false;
  return x > obstacle.x - obstacle.w / 2 - 16 && x < obstacle.x + obstacle.w / 2 + 16
      && y > obstacle.y - obstacle.h / 2 - 16 && y < obstacle.y + obstacle.h / 2 + 16;
}

function reset() {
  // 根据场景设置起始/目标
  if (SCN.hasObstacle) {
    // 起点在左，终点在右，中间有墙
    agent = { x: W * 0.1 + Math.random() * 40, y: H * 0.3 + Math.random() * (H * 0.4), vx: 0, vy: 0 };
    target = { x: W * 0.88, y: H * 0.3 + Math.random() * (H * 0.4), vx: 0, vy: 0 };
  } else {
    agent = { x: W * 0.2 + Math.random() * 80, y: H * 0.3 + Math.random() * (H * 0.4), vx: 0, vy: 0 };
    target = {
      x: W * 0.6 + Math.random() * 100,
      y: H * 0.3 + Math.random() * (H * 0.4),
      vx: SCN.moveTarget ? (Math.random() - 0.5) * 2 : 0,
      vy: SCN.moveTarget ? (Math.random() - 0.5) * 2 : 0,
    };
  }
  trail = [];
}

async function runEpisode() {
  reset();
  let total = 0;
  for (let t = 0; t < 100; t++) {
    // 目标移动
    if (SCN.moveTarget) {
      target.x += target.vx;
      target.y += target.vy;
      if (target.x < 100 || target.x > W - 100) target.vx *= -1;
      if (target.y < 50 || target.y > H - 50) target.vy *= -1;
    }
    const s = [(agent.x - target.x) / 100, (agent.y - target.y) / 100];
    const aDet = actor.act(s);
    // 加 OU 噪声（简化为高斯）
    const a = [ aDet[0] + (Math.random() - 0.5) * sigma * 2, aDet[1] + (Math.random() - 0.5) * sigma * 2 ];
    // 环境动力学
    const prevX = agent.x, prevY = agent.y;
    agent.vx = agent.vx * 0.9 + a[0] * 2;
    agent.vy = agent.vy * 0.9 + a[1] * 2;
    agent.x += agent.vx;
    agent.y += agent.vy;
    // 障碍物碰撞：撞墙则回到原位并速度减半
    if (hitObstacle(agent.x, agent.y)) {
      agent.x = prevX; agent.y = prevY;
      agent.vx *= -0.5; agent.vy *= -0.5;
    }
    trail.push({ x: agent.x, y: agent.y });
    if (trail.length > 40) trail.shift();

    const dist = Math.hypot(agent.x - target.x, agent.y - target.y);
    const reward = -dist / 100;
    total += reward;

    // Actor 更新（梯度方向：向 -s 方向靠近）
    const norm = Math.hypot(s[0], s[1]) + 1e-6;
    const dir = [-s[0] / norm, -s[1] / norm];
    const lr = 0.01;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) actor.W[i][j] += lr * dir[i] * s[j] * 0.05;
      actor.b[i] += lr * dir[i] * 0.05;
    }
    // 软更新
    actor.copyTo(targetActor, tau);

    document.getElementById('dist').textContent = dist.toFixed(1);
    document.getElementById('qval').textContent = critic.Q(s, aDet).toFixed(3);
    render();
    await new Promise(r => setTimeout(r, 80));
    if (dist < 25) break;
  }
  return total;
}

async function train() {
  if (running) return;
  running = true;
  const btn = document.getElementById('train-btn');
  btn.textContent = '⏳ 训练中...'; btn.disabled = true;
  for (let ep = 0; ep < 30; ep++) {
    document.getElementById('ep').textContent = ep + 1;
    rewards.push(+(await runEpisode()).toFixed(1));
    updateChart();
  }
  btn.textContent = '▶ 训练'; btn.disabled = false;
  running = false;
}

document.getElementById('sigma').addEventListener('input', e => { sigma = +e.target.value; document.getElementById('sigma-val').textContent = sigma.toFixed(2); render(); });
document.getElementById('tau').addEventListener('input', e => { tau = +e.target.value; document.getElementById('tau-val').textContent = tau.toFixed(3); });
document.getElementById('train-btn').addEventListener('click', train);
document.getElementById('reset-btn').addEventListener('click', () => {
  actor = new Actor(); targetActor = new Actor(); actor.copyTo(targetActor);
  rewards = []; reset(); updateChart(); render();
  document.getElementById('ep').textContent = 0;
});

reset(); render();

// 场景选择器
renderScenePicker('#scene-picker-slot', [
  { id: 'static', icon: '🎯', label: '静止目标', desc: '目标位置固定' },
  { id: 'moving', icon: '✈️', label: '移动目标', desc: '目标会缓慢移动' },
  { id: 'obstacle', icon: '🧱', label: '障碍穿越', desc: '中间有墙要绕行' },
], 'static', (id) => {
  currentScene = id;
  SCN = DDPG_SCENES[id];
  // 重置智能体和网络
  actor = new Actor(); targetActor = new Actor(); actor.copyTo(targetActor);
  rewards = [];
  updateChart();
  reset();
  render();
  document.getElementById('ep').textContent = 0;
});

renderFooter();
window.addEventListener('resize', () => rewardChart.resize());

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🤖 智能体', v: '要学会追踪目标的主角。初始位置随机。' },
    { k: '🎯 目标点', v: '红色圆形。每回合随机位置。' },
    { k: '🟣 紫色折线', v: '最近 40 步的移动轨迹。初期乱七八糟，学习后变成指向目标的直线。' },
    { k: '🟠 粉色虚圈', v: '探索噪声半径。σ 越大圈越大，代表动作随机性越强。' },
    { k: '🎚️ σ 滑块', v: 'OU/高斯 噪声标准差。平衡探索和利用。' },
    { k: '🎚️ τ 滑块', v: '目标网络软更新速率。通常 0.005，越小目标越稳但学得慢。' },
    { k: '🔢 距离 / Q', v: '当前到目标距离；Critic 给当前 (s,a) 打的分。' },
    { k: '📈 奖励曲线', v: '每回合累计奖励 = 所有步 −距离/100 之和。从 -100+ 上升到 -10 左右说明学会了。' },
  ],
});
