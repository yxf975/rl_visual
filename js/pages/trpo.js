import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('trpo');
renderAlgoOverview('trpo');
mountComicButton(COMICS.trpo);

renderGoalCard(null, {
  what: '一个<b>2D 策略参数空间</b>的可视化。把高维策略参数 θ 投影到二维平面，背景同心圆表示目标函数 J(θ)（中心越亮越优），🟠 是当前策略，🎯 是最优点。',
  goal: '直观理解 TRPO 如何在"旧策略 θ_old"周围画一个 KL 信赖域（紫色圆圈），确保每一步更新都在圈内，避免策略崩溃。',
  success: '不断点"单步更新"或"自动"，观察：① 策略点从左下向中心移动 ② 每步移动距离被紫色圈限制 ③ 实际 KL 值 ≤ 你设的 δ ④ 奖励值单调上升。',
  metrics: [
    '🟠 <b>橙色点</b>：当前策略 θ 的位置',
    '🟢 <b>绿色点</b>：上一步更新后的新策略',
    '🟣 <b>紫色圆圈</b>：KL 信赖域（半径随 δ 变化）',
    '🌈 <b>粉色折线</b>：策略参数的历史轨迹',
  ],
  note: '改变 δ 滑块看变化：δ 越大 → 圈越大 → 每步迈得越远 → 但风险更高。TRPO 的精髓是"安全又快速"。',
});

// 构造一个 2D 参数空间 θ = (θ1, θ2)
// 奖励函数 J(θ) = -((θ1 - tx)² + (θ2 - ty)²) + 扰动 —— 我们让目标中心在 (3, 2)
// KL 约束用 L2 距离代替（简化）

const canvas = document.getElementById('trpo-canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const TARGET = [3, 2];
let theta = [-3, -2.5]; // 初始 θ_old
let deltaKL = 0.05;
let iter = 0;
let history = [[...theta]];
let autoTimer = null;

function J(t) {
  return -((t[0] - TARGET[0]) ** 2 + (t[1] - TARGET[1]) ** 2);
}

function world2screen(x, y) {
  return [ (x + 5) / 10 * W, H - (y + 5) / 10 * H ];
}

function render() {
  // 清空
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  // 绘制等高线（同心圆）
  for (let r = 0.5; r <= 9; r += 0.5) {
    const [cx, cy] = world2screen(TARGET[0], TARGET[1]);
    const [ex, _] = world2screen(TARGET[0] + r, TARGET[1]);
    const rPx = Math.abs(ex - cx);
    const alpha = 0.5 - r * 0.05;
    ctx.strokeStyle = `rgba(139,92,246,${Math.max(0.05, alpha)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 最优点
  const [tx, ty] = world2screen(TARGET[0], TARGET[1]);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(tx, ty, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#b45309';
  ctx.fillText('🎯 最优', tx + 12, ty - 5);

  // 历史轨迹
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  history.forEach((p, i) => {
    const [x, y] = world2screen(p[0], p[1]);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  history.forEach((p, i) => {
    const [x, y] = world2screen(p[0], p[1]);
    ctx.fillStyle = i === history.length - 1 ? '#10b981' : '#f97316';
    ctx.beginPath();
    ctx.arc(x, y, i === history.length - 1 ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();
  });
  // 信赖域圈
  const [cx, cy] = world2screen(theta[0], theta[1]);
  const [rx, _] = world2screen(theta[0] + Math.sqrt(deltaKL * 20), theta[1]);
  const radius = Math.abs(rx - cx);
  ctx.strokeStyle = 'rgba(139,92,246,0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(139,92,246,0.08)';
  ctx.fill();

  // 标签
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#7c3aed';
  ctx.fillText(`KL≤${deltaKL.toFixed(3)}`, cx - 30, cy - radius - 8);
}

function oneStep() {
  // 梯度方向指向目标
  const grad = [ TARGET[0] - theta[0], TARGET[1] - theta[1] ];
  const norm = Math.hypot(grad[0], grad[1]);
  // 最大步长受 KL 约束：step = sqrt(2δ / g^T F^-1 g)，简化为 sqrt(δ * k)
  const maxStep = Math.sqrt(deltaKL * 20);
  const step = Math.min(maxStep, norm);
  const dir = [grad[0] / norm, grad[1] / norm];
  theta = [ theta[0] + dir[0] * step, theta[1] + dir[1] * step ];
  history.push([...theta]);
  iter++;
  const klActual = step * step / 20;
  document.getElementById('iter').textContent = iter;
  document.getElementById('rw').textContent = J(theta).toFixed(2);
  document.getElementById('kl').textContent = klActual.toFixed(4);
  render();
}

function reset() {
  theta = [-3, -2.5]; iter = 0; history = [[...theta]];
  document.getElementById('iter').textContent = 0;
  document.getElementById('rw').textContent = '-';
  document.getElementById('kl').textContent = '-';
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  render();
}

document.getElementById('delta').addEventListener('input', e => { deltaKL = +e.target.value; document.getElementById('delta-val').textContent = deltaKL.toFixed(3); render(); });
document.getElementById('step-btn').addEventListener('click', oneStep);
document.getElementById('reset-btn').addEventListener('click', reset);
document.getElementById('auto-btn').addEventListener('click', () => {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; return; }
  autoTimer = setInterval(() => {
    oneStep();
    const dist = Math.hypot(TARGET[0] - theta[0], TARGET[1] - theta[1]);
    if (dist < 0.05 || iter > 100) { clearInterval(autoTimer); autoTimer = null; }
  }, 600);
});

render();
renderFooter();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🌈 背景同心圆', v: '目标函数 J(θ) 的等高线。越靠近黄色中心 🎯 越优。' },
    { k: '🎯 黄色中心', v: '最优策略 θ*，当前环境下的"完美"位置。' },
    { k: '🟠 橙色圆点', v: '历史经过的策略位置。粉色折线是轨迹。' },
    { k: '🟢 绿色圆点', v: '当前（最新）策略。每次更新后会移动。' },
    { k: '🟣 紫色虚线圆', v: 'KL 信赖域边界。新策略必须在圈内。' },
    { k: '📊 迭代次数', v: '已执行的更新步数。好的 TRPO 会很快接近最优点。' },
    { k: '📊 当前奖励', v: 'J(θ) 的值，单调上升说明算法稳定。' },
    { k: '📊 实际 KL', v: '本步新旧策略的 KL 散度，总是 ≤ δ。' },
    { k: '🎚️ δ 滑块', v: '调节信赖域半径。' },
  ],
});

window.addEventListener('resize', () => { });
