// 页面通用工具：渲染页面顶部导航（按篇章分组）、训练目标卡、读懂动画面板、场景切换器
import { ALGORITHMS, CHAPTERS, groupByChapter, getAdjacentAlgorithms } from './algorithms.js';
import { OVERVIEW_DATA } from './algo-overview-data.js';
import { COMICS } from './comics-data.js';
import { launchComic } from './comic-engine.js';

export function renderNav(activeId) {
  const groups = groupByChapter();
  const nav = document.createElement('nav');
  nav.className = 'sticky top-0 z-40 backdrop-blur bg-white/85 border-b border-brand-100 shadow-sm';
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
      <a href="../index.html" class="flex items-center gap-2 flex-shrink-0">
        <span class="text-2xl">🎮</span>
        <span class="font-bold text-base bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">RL 可视化学园</span>
      </a>
      <div class="flex items-center gap-1 text-xs flex-wrap">
        ${groups.map(g => `
          <div class="nav-chapter-group">
            <span class="nav-chapter-tag" title="${g.chapter.title}">${g.chapter.emoji}</span>
            ${g.items.map(a => `
              <a href="../${a.page}" class="nav-item ${a.id === activeId ? 'active' : ''}">${a.icon} ${shortenName(a.name)}</a>
            `).join('')}
          </div>
        `).join('<span class="nav-divider">·</span>')}
        <a href="../pages/comics.html" class="nav-item nav-extra">🎨 合集</a>
      </div>
    </div>
    <style>
      .nav-chapter-group { display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; background: #faf8ff; border-radius: 9999px; }
      .nav-chapter-tag { font-size: 0.95rem; padding: 0 4px; }
      .nav-item { padding: 3px 8px; border-radius: 6px; color: #4b5563; transition: all 0.15s; font-weight: 500; }
      .nav-item:hover { background: #ede9fe; color: #6d28d9; }
      .nav-item.active { background: #8b5cf6; color: white; font-weight: 700; }
      .nav-item.nav-extra { background: linear-gradient(135deg,#fce7f3,#ede9fe); color: #7c3aed; font-weight: 700; }
      .nav-divider { color: #c4b5fd; margin: 0 2px; }
    </style>
  `;
  document.body.insertBefore(nav, document.body.firstChild);

  // 在标题下面自动插入"章节导读卡"（如果 active 算法存在）
  const active = ALGORITHMS.find(a => a.id === activeId);
  if (active) {
    renderChapterBreadcrumb(active);
    renderContextBanner(active);
    // 页脚之前自动挂载章节导航
    setTimeout(() => renderChapterNav(active), 0);
  }
}

// 导航栏里展示简短名称
function shortenName(name) {
  // "多臂老虎机" -> "多臂老虎机"； "MDP 马尔可夫决策过程" -> "MDP"； "时序差分 (SARSA & Q-Learning)" -> "时序差分"
  return name
    .replace(/\s*\(.*\)$/, '')   // 去括号
    .replace(/^(MDP|DQN|TRPO|PPO|DDPG|LLM)\s.*$/, '$1')
    .split(' ')[0];
}

function renderChapterBreadcrumb(algo) {
  const chapter = CHAPTERS.find(c => c.id === algo.chapter);
  if (!chapter) return;
  const container = document.querySelector('.page-container');
  if (!container) return;
  const bc = document.createElement('div');
  bc.className = 'mb-4';
  bc.innerHTML = `
    <div class="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
      <a href="../index.html" class="hover:text-brand-600">🏠 首页</a>
      <span>›</span>
      <a href="../index.html#chapters-root" class="hover:text-brand-600">${chapter.emoji} ${chapter.title}</a>
      <span>›</span>
      <span class="text-brand-600 font-bold">${algo.icon} ${algo.name}</span>
    </div>
  `;
  container.insertBefore(bc, container.firstChild);
}

// 在 .page-desc 之后插入一个"上下文定位条"：为什么需要这个 / 学完还有什么不足
function renderContextBanner(algo) {
  if (!algo.positioning && !algo.nextHint) return;
  const container = document.querySelector('.page-container');
  if (!container) return;
  const desc = container.querySelector('.page-desc');
  if (!desc) return;
  const { prev, next } = getAdjacentAlgorithms(algo.id);
  const banner = document.createElement('div');
  banner.className = 'context-banner';
  banner.innerHTML = `
    <div class="context-banner-row">
      <span class="context-banner-tag context-banner-prev">⬅ 承上</span>
      <div class="context-banner-text">
        ${prev ? `<span class="context-banner-prevlink">上一章 <b>${prev.icon} ${prev.name}</b> · </span>` : ''}
        ${algo.positioning || ''}
      </div>
    </div>
    <div class="context-banner-row">
      <span class="context-banner-tag context-banner-next">启下 ➡</span>
      <div class="context-banner-text">
        ${algo.nextHint || ''}
        ${next ? `<span class="context-banner-nextlink"> · 下一章 <b>${next.icon} ${next.name}</b></span>` : ''}
      </div>
    </div>
  `;
  // 插入到 desc 之后
  if (desc.nextSibling) container.insertBefore(banner, desc.nextSibling);
  else container.appendChild(banner);
}

/**
 * 渲染底部章节导航："上一章 / 回到首页 / 下一章"
 * 若 active 在首页或漫画合集页则不渲染
 */
export function renderChapterNav(algo) {
  if (!algo) return;
  const container = document.querySelector('.page-container');
  if (!container) return;
  // 防止重复挂载
  if (container.querySelector('.chapter-nav-bottom')) return;
  const { prev, next } = getAdjacentAlgorithms(algo.id);
  const box = document.createElement('div');
  box.className = 'chapter-nav-bottom';
  box.innerHTML = `
    <div class="chapter-nav-inner">
      ${prev ? `
        <a href="${prev.page.replace(/^pages\//, '')}" class="chapter-nav-card prev">
          <div class="chapter-nav-dir">◀ 上一章</div>
          <div class="chapter-nav-title">${prev.icon} ${prev.name}</div>
          <div class="chapter-nav-hint">${prev.takeaway || ''}</div>
        </a>
      ` : '<span></span>'}
      <a href="../index.html" class="chapter-nav-card home">
        <div class="chapter-nav-dir">🏠 回首页</div>
        <div class="chapter-nav-title">查看所有篇章</div>
        <div class="chapter-nav-hint">温习整条学习路径</div>
      </a>
      ${next ? `
        <a href="${next.page.replace(/^pages\//, '')}" class="chapter-nav-card next">
          <div class="chapter-nav-dir">下一章 ▶</div>
          <div class="chapter-nav-title">${next.icon} ${next.name}</div>
          <div class="chapter-nav-hint">${next.positioning || next.desc || ''}</div>
        </a>
      ` : `
        <div class="chapter-nav-card next finish">
          <div class="chapter-nav-dir">🎉 已完成</div>
          <div class="chapter-nav-title">恭喜走完整个学习路径</div>
          <div class="chapter-nav-hint">${algo.nextHint || ''}</div>
        </div>
      `}
    </div>
  `;
  container.appendChild(box);
}

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'mt-12 border-t border-brand-100 bg-white/60 backdrop-blur';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
      <p>由 <a href="https://with.woa.com/" style="color: #8A2BE2;" target="_blank">With</a> 通过自然语言生成</p>
    </div>
  `;
  document.body.appendChild(footer);
}

/**
 * 渲染训练目标卡：说明这个环境在做什么、目标是什么、如何算作成功
 * @param {string} selector 容器选择器，若为空则插入 page-container 顶部
 * @param {{what:string, goal:string, success:string, metrics:string[], note?:string}} goal
 */
export function renderGoalCard(selector, goal) {
  const html = `
    <div class="goal-card">
      <p><b>🌍 环境是什么：</b>${goal.what}</p>
      <p><b>🏆 我们在优化什么：</b>${goal.goal}</p>
      <p><b>✅ 什么叫训练成功：</b>${goal.success}</p>
      ${goal.metrics?.length ? `<p><b>📊 建议观察的指标：</b></p><ul>${goal.metrics.map(m => `<li>${m}</li>`).join('')}</ul>` : ''}
      ${goal.note ? `<p class="mt-2 text-xs italic">${goal.note}</p>` : ''}
    </div>
  `;
  if (selector) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  } else {
    const container = document.querySelector('.page-container');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    // 插到 breadcrumb 与 h1 之后（即 .page-desc 之后）
    const desc = container.querySelector('.page-desc');
    if (desc && desc.nextSibling) container.insertBefore(wrap.firstElementChild, desc.nextSibling);
    else container.appendChild(wrap.firstElementChild);
  }
}

/**
 * 渲染"读懂动画"说明卡：列出动画中的元素与含义
 * @param {string} selector
 * @param {{title?:string, items: {k:string, v:string}[]}} data
 */
export function renderExplainCard(selector, data) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `
    <div class="explain-card">
      <div class="explain-grid">
        ${data.items.map(it => `
          <div class="explain-item">
            <span class="k">${it.k}</span>
            <span class="v">${it.v}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染场景选择器
 * @param {string} selector 容器
 * @param {{id:string, icon:string, label:string, desc?:string}[]} scenes
 * @param {string} activeId
 * @param {(id:string)=>void} onChange
 */
export function renderScenePicker(selector, scenes, activeId, onChange) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `
    <div class="scene-picker">
      <span class="scene-picker-label">🎬 选择可视化场景：</span>
      ${scenes.map(s => `
        <button class="scene-btn ${s.id === activeId ? 'active' : ''}" data-scene="${s.id}" title="${s.desc || ''}">
          <span>${s.icon}</span><span>${s.label}</span>
        </button>
      `).join('')}
    </div>
  `;
  el.querySelectorAll('.scene-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.scene);
    });
  });
}

/**
 * 渲染速度控制器
 * @param {string} selector 容器选择器
 * @param {(mult:number)=>void} onChange
 */
export function renderSpeedControl(selector, onChange, initial = 1) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `
    <div class="speed-control">
      <span>⏱️ 动画速度</span>
      <select id="speed-sel">
        <option value="0.5">0.5× 慢动作</option>
        <option value="1" ${initial === 1 ? 'selected' : ''}>1× 正常</option>
        <option value="2">2× 加速</option>
        <option value="4">4× 快进</option>
      </select>
    </div>
  `;
  el.querySelector('#speed-sel').addEventListener('change', e => onChange(+e.target.value));
}

export function setPageTitle(title, desc) {
  const container = document.querySelector('.page-container');
  if (!container) return;
  const header = document.createElement('div');
  header.innerHTML = `
    <h1 class="page-title">${title}</h1>
    <p class="page-desc">${desc}</p>
  `;
  container.insertBefore(header, container.firstChild);
}

/**
 * 渲染算法全景卡：自动驾驶类比 + 伪代码 + 流程图
 * 自动插入到 .page-desc 后面（context-banner 之后）
 * @param {string} algoKey - OVERVIEW_DATA 中的 key（如 'td', 'bandit'）
 */
export function renderAlgoOverview(algoKey) {
  const data = OVERVIEW_DATA[algoKey];
  if (!data) return;

  const container = document.querySelector('.page-container');
  if (!container) return;

  // 找到插入位置：context-banner 之后，如果没有则在 page-desc 之后
  const banner = container.querySelector('.context-banner');
  const desc = container.querySelector('.page-desc');
  const insertAfter = banner || desc;
  if (!insertAfter) return;

  const card = document.createElement('div');
  card.className = 'algo-overview-card fade-in';

  // 0. "先读漫画"引导 banner —— 算法页最重要的学习入口
  const comic = COMICS[algoKey];
  let bannerHtml = '';
  if (comic) {
    const frameCount = comic.frames.length;
    const estMin = Math.max(2, Math.round(frameCount * 0.4));
    bannerHtml = `
      <div class="read-first-banner" id="read-first-banner">
        <div class="rfb-left">
          <div class="rfb-emoji">📖</div>
          <div class="rfb-text">
            <div class="rfb-title">先看 <span class="rfb-accent">3 分钟漫画精读</span>，再动手玩动画效果更好</div>
            <div class="rfb-sub">共 <b>${frameCount}</b> 格 · 约 <b>${estMin}</b> 分钟 · <b>滚动即可阅读</b>，一页读完不用翻页</div>
          </div>
        </div>
        <button class="rfb-cta" id="rfb-cta-btn" type="button">🎨 打开漫画精读 →</button>
      </div>
    `;
  }

  // 1. 自动驾驶类比
  let carHtml = `
    <div class="car-scene">
      <p>${data.carStory}</p>
      ${data.mapping ? `
        <div class="car-mapping">
          ${data.mapping.map(m => `<div class="car-mapping-item"><span>${m.label}</span> = ${m.value}</div>`).join('')}
        </div>
      ` : ''}
      ${data.carStoryExtra ? `
        <div class="car-extra-toggle" id="car-extra-toggle">
          <span class="car-extra-icon">🔎</span>
          <span class="car-extra-label">展开更多深度解读</span>
          <span class="arrow">▶</span>
        </div>
        <div class="car-extra-body" id="car-extra-body" style="display:none;">
          ${data.carStoryExtra}
        </div>
      ` : ''}
    </div>
  `;

  // 2. 伪代码（默认展开）
  let pseudoHtml = '';
  if (data.pseudocode && data.pseudocode.length) {
    const lines = data.pseudocode.map(line => {
      if (line.section) {
        return `<span class="section-label">${line.section}</span>`;
      }
      return `<div class="line"><span class="code">${line.code}</span>${line.comment ? `<span class="comment"># ${line.comment}</span>` : ''}</div>`;
    }).join('\n');

    pseudoHtml = `
      <div class="pseudocode-wrap">
        <div class="pseudocode-toggle open" id="pseudo-toggle">
          <span>伪代码</span>
          <span class="arrow">▶</span>
        </div>
        <div class="pseudocode" id="pseudo-body">
          ${lines}
        </div>
      </div>
    `;
  }

  // 3. 流程图
  let flowHtml = '';
  if (data.flow && data.flow.length) {
    const steps = data.flow.map((s, i) => {
      const arrow = i < data.flow.length - 1 ? '<span class="flow-arrow-right">→</span>' : '';
      return `<div class="flow-step"><span class="step-icon">${s.icon}</span>${s.label}</div>${arrow}`;
    }).join('');

    flowHtml = `
      <div class="overview-section-title">🔁 算法流程</div>
      <div class="flow-steps">
        ${steps}
      </div>
      ${data.flowLoop ? `<div class="flow-loop-back">${data.flowLoop}</div>` : ''}
    `;
  }

  card.innerHTML = bannerHtml + carHtml + pseudoHtml + flowHtml;

  // 插入到 insertAfter 之后
  if (insertAfter.nextSibling) {
    container.insertBefore(card, insertAfter.nextSibling);
  } else {
    container.appendChild(card);
  }

  // Banner "打开漫画精读"按钮 —— 触发长图阅读模式
  const bannerBtn = card.querySelector('#rfb-cta-btn');
  if (bannerBtn && comic) {
    bannerBtn.addEventListener('click', () => launchComic(comic, { mode: 'scroll' }));
  }

  // 伪代码折叠/展开交互
  const toggle = card.querySelector('#pseudo-toggle');
  const body = card.querySelector('#pseudo-body');
  if (toggle && body) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.contains('open');
      if (isOpen) {
        toggle.classList.remove('open');
        body.style.display = 'none';
      } else {
        toggle.classList.add('open');
        body.style.display = '';
      }
    });
  }

  // 深度解读折叠/展开
  const extraToggle = card.querySelector('#car-extra-toggle');
  const extraBody = card.querySelector('#car-extra-body');
  if (extraToggle && extraBody) {
    extraToggle.addEventListener('click', () => {
      const isOpen = extraToggle.classList.contains('open');
      const label = extraToggle.querySelector('.car-extra-label');
      if (isOpen) {
        extraToggle.classList.remove('open');
        extraBody.style.display = 'none';
        if (label) label.textContent = '展开更多深度解读';
      } else {
        extraToggle.classList.add('open');
        extraBody.style.display = '';
        if (label) label.textContent = '收起深度解读';
      }
    });
  }
}