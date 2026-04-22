import { renderNav, renderFooter, renderGoalCard, renderExplainCard, renderScenePicker, renderAlgoOverview } from '../page-common.js';
import { mountComicButton } from '../comic-engine.js';
import { COMICS } from '../comics-data.js';

renderNav('td');
renderAlgoOverview('td');
mountComicButton(COMICS.td);

renderGoalCard(null, {
  what: '<b>三种 Gridworld 环境任你切换</b>。每种环境对 SARSA 和 Q-Learning 的"性格差异"都会有不同表现。',
  goal: '对比 SARSA（on-policy）和 Q-Learning（off-policy）在同样环境下的学习行为差异。重点是观察<b>它们最终选择的路线</b>。',
  success: '训练 200 回合后：Q-Learning 学到<b>贴危险区最短路线</b>（理论最优但训练时常吃亏）；SARSA 学到<b>更安全的绕路路线</b>（训练时累计奖励反而更高）。',
  metrics: [
    '🏹 <b>网格上的箭头</b>：每格显示学到的最优动作。注意两算法在靠近危险区时的差异！',
    '📈 <b>累计奖励曲线</b>：每回合的总奖励，越接近 0 越好。',
    '🤖 <b>训练结束后的回放</b>：最后会展示学到的策略走一遍最优路径。',
  ],
  note: '建议先选"🆚 对比"模式，再切换不同场景，最能看出两个算法的性格差异。',
});

// ==================== 场景定义 ====================
// 每种场景：12列×4行（保持一致），不同的危险区/起点/终点/额外规则
const SCENES = {
  cliff: {
    name: '悬崖行走',
    desc: '底部一排悬崖（-100分，回起点但不结束）。经典测试环境。',
    cols: 12, rows: 4,
    start: [0, 3], goal: [11, 3],
    isDanger: (x, y) => y === 3 && x >= 1 && x <= 10,
    dangerReward: -100, dangerReset: true, stepReward: -1,
    slip: 0,
    emojis: { danger: '☠️', start: '🏁', goal: '💎' },
    tip: 'Q-Learning 会贴着悬崖走最短路；SARSA 会往上走一格绕行。',
  },
  maze: {
    name: '迷宫寻宝',
    desc: '中间是墙壁（不可穿越），绕道找宝藏。考察"路径规划"能力。',
    cols: 12, rows: 4,
    start: [0, 0], goal: [11, 0],
    isDanger: (x, y) => (y === 1 && x >= 2 && x <= 9) || (y === 2 && x >= 2 && x <= 9),
    dangerReward: 0, dangerReset: false, stepReward: -1, // 墙壁不可进入（treated as obstacle by envStep）
    slip: 0,
    emojis: { danger: '🧱', start: '🏁', goal: '💎' },
    tip: '两算法都会学到绕墙路线，但收敛速度略有差异。',
  },
  frozen: {
    name: '冰湖滑动',
    desc: '地面打滑（20% 概率偏向），多了一排冰窟（-50分，回起点）。',
    cols: 12, rows: 4,
    start: [0, 3], goal: [11, 3],
    isDanger: (x, y) => y === 2 && [3, 6, 9].includes(x),
    dangerReward: -50, dangerReset: true, stepReward: -1,
    slip: 0.2, // 20% 概率转向
    emojis: { danger: '🕳️', start: '🏁', goal: '💎' },
    tip: '地面打滑让 Q-Learning 的"最优"也不靠谱—— SARSA 的保守反而更占优。',
  },
};

let currentScene = 'cliff';
let SCN = SCENES[currentScene];

function isWall(x, y) {
  // 只有 maze 场景的 isDanger 是墙
  if (currentScene === 'maze') return SCN.isDanger(x, y);
  return false;
}

function envStep(x, y, a) {
  // 0上 1右 2下 3左
  let aReal = a;
  // 滑动：一定概率转向相邻方向
  if (SCN.slip > 0 && Math.random() < SCN.slip) {
    aReal = Math.random() < 0.5 ? (a + 1) % 4 : (a + 3) % 4;
  }
  const dx = [0, 1, 0, -1][aReal], dy = [-1, 0, 1, 0][aReal];
  let nx = Math.max(0, Math.min(SCN.cols - 1, x + dx));
  let ny = Math.max(0, Math.min(SCN.rows - 1, y + dy));
  // 撞墙：保持原地
  if (isWall(nx, ny)) { nx = x; ny = y; }
  let r = SCN.stepReward, done = false;
  if (!isWall(nx, ny) && currentScene !== 'maze' && SCN.isDanger(nx, ny)) {
    r = SCN.dangerReward;
    if (SCN.dangerReset) { nx = SCN.start[0]; ny = SCN.start[1]; }
    else done = true;
  } else if (nx === SCN.goal[0] && ny === SCN.goal[1]) {
    r = 0; done = true;
  }
  return { nx, ny, r, done };
}

function makeQ() {
  // Q[y][x][a]
  return Array.from({ length: SCN.rows }, () => Array.from({ length: SCN.cols }, () => [0, 0, 0, 0]));
}
function argmax(arr) { let m = -Infinity, idx = 0; arr.forEach((v, i) => { if (v > m) { m = v; idx = i; } }); return idx; }
function choose(q, eps) { if (Math.random() < eps) return Math.floor(Math.random() * 4); return argmax(q); }

function renderQGrid(container, Q, title, agentPos = null, color = '#8b5cf6') {
  const cell = 50;
  const w = SCN.cols * cell, h = SCN.rows * cell;
  let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;background:#fff;">`;
  for (let y = 0; y < SCN.rows; y++) {
    for (let x = 0; x < SCN.cols; x++) {
      let fill = '#ffffff';
      if (SCN.isDanger(x, y) && !(x === SCN.goal[0] && y === SCN.goal[1]) && !(x === SCN.start[0] && y === SCN.start[1])) {
        fill = currentScene === 'maze' ? '#9ca3af' : (currentScene === 'frozen' ? '#bfdbfe' : '#fecaca');
      } else if (x === SCN.start[0] && y === SCN.start[1]) fill = '#fef3c7';
      else if (x === SCN.goal[0] && y === SCN.goal[1]) fill = '#dcfce7';
      else {
        const maxA = Math.max(...Q[y][x]);
        const t = Math.min(1, Math.max(0, (maxA + 20) / 20));
        fill = `rgba(139,92,246,${t * 0.5})`;
      }
      svg += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fill}" stroke="#d1d5db"/>`;
      if (SCN.isDanger(x, y) && !(x === SCN.goal[0] && y === SCN.goal[1]) && !(x === SCN.start[0] && y === SCN.start[1])) {
        svg += `<text x="${x*cell+cell/2}" y="${y*cell+cell*0.65}" text-anchor="middle" font-size="${cell*0.5}">${SCN.emojis.danger}</text>`;
      } else if (x === SCN.start[0] && y === SCN.start[1]) {
        svg += `<text x="${x*cell+cell/2}" y="${y*cell+cell*0.65}" text-anchor="middle" font-size="${cell*0.5}">${SCN.emojis.start}</text>`;
      } else if (x === SCN.goal[0] && y === SCN.goal[1]) {
        svg += `<text x="${x*cell+cell/2}" y="${y*cell+cell*0.65}" text-anchor="middle" font-size="${cell*0.5}">${SCN.emojis.goal}</text>`;
      } else {
        const best = argmax(Q[y][x]);
        const arrow = ['↑', '→', '↓', '←'][best];
        const bestQ = Q[y][x][best];
        if (Math.abs(bestQ) > 0.01) {
          svg += `<text x="${x*cell+cell/2}" y="${y*cell+cell*0.6}" text-anchor="middle" font-size="${cell*0.45}" fill="${color}" font-weight="900">${arrow}</text>`;
        }
      }
    }
  }
  if (agentPos) {
    svg += `<text x="${agentPos[0]*cell+cell/2}" y="${agentPos[1]*cell+cell*0.65}" text-anchor="middle" font-size="${cell*0.5}">🤖</text>`;
  }
  svg += '</svg>';
  container.innerHTML = `<div class="text-sm font-bold mb-2 text-center" style="color:${color}">${title}</div>` + svg + `<div class="text-xs text-gray-500 text-center mt-1">${SCN.tip}</div>`;
}

// ========== 训练 ==========
let Q_sarsa = makeQ(), Q_qlearn = makeQ();
let rewards_sarsa = [], rewards_qlearn = [];
let algo = 'both';
let alpha = 0.5, eps = 0.1;
const GAMMA = 0.9;

function trainEpisode(Q, isQLearn) {
  let [x, y] = [...SCN.start];
  let a = choose(Q[y][x], eps);
  let total = 0;
  for (let t = 0; t < 200; t++) {
    const { nx, ny, r, done } = envStep(x, y, a);
    total += r;
    let target;
    if (isQLearn) {
      target = r + GAMMA * Math.max(...Q[ny][nx]);
    } else {
      const a2 = choose(Q[ny][nx], eps);
      target = r + GAMMA * Q[ny][nx][a2];
      Q[y][x][a] += alpha * (target - Q[y][x][a]);
      x = nx; y = ny; a = a2;
      if (done) return total;
      continue;
    }
    Q[y][x][a] += alpha * (target - Q[y][x][a]);
    x = nx; y = ny;
    a = choose(Q[y][x], eps);
    if (done) break;
  }
  return total;
}

function renderAll(highlight) {
  const container = document.getElementById('dual-container');
  if (algo === 'both') {
    container.className = 'grid md:grid-cols-2 gap-5 mb-6';
    container.innerHTML = '<div class="panel" id="box-sarsa"></div><div class="panel" id="box-qlearn"></div>';
    renderQGrid(document.getElementById('box-sarsa'), Q_sarsa, '👧 SARSA（保守派）', highlight?.sarsa, '#0ea5e9');
    renderQGrid(document.getElementById('box-qlearn'), Q_qlearn, '🦸 Q-Learning（激进派）', highlight?.qlearn, '#ec4899');
  } else if (algo === 'sarsa') {
    container.className = 'mb-6';
    container.innerHTML = '<div class="panel" id="box-sarsa"></div>';
    renderQGrid(document.getElementById('box-sarsa'), Q_sarsa, '👧 SARSA', highlight?.sarsa, '#0ea5e9');
  } else {
    container.className = 'mb-6';
    container.innerHTML = '<div class="panel" id="box-qlearn"></div>';
    renderQGrid(document.getElementById('box-qlearn'), Q_qlearn, '🦸 Q-Learning', highlight?.qlearn, '#ec4899');
  }
  updateRewardChart();
}

const rewardChart = echarts.init(document.getElementById('reward-chart'));
function smooth(arr, w = 10) {
  return arr.map((_, i) => {
    const s = Math.max(0, i - w), e = Math.min(arr.length, i + w);
    let sum = 0; for (let k = s; k < e; k++) sum += arr[k];
    return sum / (e - s);
  });
}
function updateRewardChart() {
  const series = [];
  if (algo !== 'qlearn' && rewards_sarsa.length) {
    series.push({ name: 'SARSA', type: 'line', data: smooth(rewards_sarsa), showSymbol: false, itemStyle: { color: '#0ea5e9' } });
  }
  if (algo !== 'sarsa' && rewards_qlearn.length) {
    series.push({ name: 'Q-Learning', type: 'line', data: smooth(rewards_qlearn), showSymbol: false, itemStyle: { color: '#ec4899' } });
  }
  rewardChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { top: 30, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: Array.from({ length: Math.max(rewards_sarsa.length, rewards_qlearn.length) }, (_, i) => i + 1), name: '回合' },
    yAxis: { type: 'value', name: '累计奖励', min: -150, max: 0 },
    series,
  });
}

async function train() {
  const btn = document.getElementById('train-btn');
  btn.textContent = '⏳ 训练中...'; btn.disabled = true;
  const EPISODES = 200;
  for (let ep = 0; ep < EPISODES; ep++) {
    if (algo !== 'qlearn') rewards_sarsa.push(trainEpisode(Q_sarsa, false));
    if (algo !== 'sarsa') rewards_qlearn.push(trainEpisode(Q_qlearn, true));
    if (ep % 10 === 0) { renderAll(); await new Promise(r => setTimeout(r, 20)); }
  }
  renderAll();
  // 最终播放一次最优路径
  await playBest();
  btn.textContent = '▶ 训练 200 回合'; btn.disabled = false;
}

async function playBest() {
  const positions = { sarsa: [...SCN.start], qlearn: [...SCN.start] };
  for (let t = 0; t < 50; t++) {
    if (algo !== 'qlearn') {
      const [x, y] = positions.sarsa;
      if (!(x === SCN.goal[0] && y === SCN.goal[1])) {
        const a = argmax(Q_sarsa[y][x]);
        const { nx, ny } = envStep(x, y, a);
        positions.sarsa = [nx, ny];
      }
    }
    if (algo !== 'sarsa') {
      const [x, y] = positions.qlearn;
      if (!(x === SCN.goal[0] && y === SCN.goal[1])) {
        const a = argmax(Q_qlearn[y][x]);
        const { nx, ny } = envStep(x, y, a);
        positions.qlearn = [nx, ny];
      }
    }
    renderAll(positions);
    await new Promise(r => setTimeout(r, 400));
    const done = (algo === 'qlearn' || (positions.sarsa[0] === SCN.goal[0] && positions.sarsa[1] === SCN.goal[1]))
              && (algo === 'sarsa' || (positions.qlearn[0] === SCN.goal[0] && positions.qlearn[1] === SCN.goal[1]));
    if (done) break;
  }
}

function reset() {
  Q_sarsa = makeQ(); Q_qlearn = makeQ();
  rewards_sarsa = []; rewards_qlearn = [];
  renderAll();
}

// 渲染场景选择器
renderScenePicker('#scene-picker-slot', [
  { id: 'cliff', icon: '☠️', label: '悬崖行走', desc: '底部是悬崖，经典环境' },
  { id: 'maze', icon: '🧱', label: '迷宫寻宝', desc: '中间有墙壁，需绕道' },
  { id: 'frozen', icon: '🧊', label: '冰湖滑动', desc: '20%打滑+冰窟，充满不确定性' },
], 'cliff', (sceneId) => {
  currentScene = sceneId;
  SCN = SCENES[sceneId];
  reset();
});

document.querySelectorAll('[data-algo]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-algo]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    algo = btn.dataset.algo;
    renderAll();
  });
});
// 默认选中"对比"
document.querySelectorAll('[data-algo]').forEach(b => b.classList.remove('active'));
const defBtn = document.querySelector('[data-algo="both"]');
if (defBtn) defBtn.classList.add('active');
document.getElementById('alpha').addEventListener('input', e => { alpha = +e.target.value; document.getElementById('alpha-val').textContent = alpha.toFixed(2); });
document.getElementById('eps').addEventListener('input', e => { eps = +e.target.value; document.getElementById('eps-val').textContent = eps.toFixed(2); });
document.getElementById('train-btn').addEventListener('click', train);
document.getElementById('reset-btn').addEventListener('click', reset);

renderAll();

// 读懂动画
const explainWrap = document.createElement('div');
explainWrap.id = 'explain-slot';
document.querySelector('.page-container').appendChild(explainWrap);
renderExplainCard('#explain-slot', {
  items: [
    { k: '🏁 起点', v: '每回合智能体从这里出发。' },
    { k: '💎 终点', v: '到这里结束本回合。走到终点是唯一获得非负奖励的方式。' },
    { k: '☠️ 悬崖', v: '踩上去 -100 分并传送回起点（但回合不结束，继续走）。SARSA 会怕它，Q-Learning 敢贴着走。' },
    { k: '🏹 格子箭头', v: '每格学到的最优动作。有颜色说明已学到有意义的 Q 值。' },
    { k: '🤖 机器人', v: '训练结束后的"最优路径回放"时才会出现，展示算法学到的策略怎么走。' },
    { k: '📈 蓝色曲线', v: 'SARSA 每回合累计奖励。通常更稳、波动小。' },
    { k: '📈 粉色曲线', v: 'Q-Learning 每回合累计奖励。有偏激进，训练时偶尔掉悬崖导致低谷。' },
    { k: '🎚️ α 学习率', v: 'Q 值更新步长。大 → 学得快但震荡；小 → 稳但慢。' },
    { k: '🎚️ ε 探索率', v: '随机选动作的概率。大 → 多试；小 → 多用。' },
  ],
});

renderFooter();
window.addEventListener('resize', () => rewardChart.resize());
