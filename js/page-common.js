// 页面通用工具：渲染页面顶部导航（按篇章分组）、训练目标卡、读懂动画面板、场景切换器
import { ALGORITHMS, CHAPTERS, groupByChapter, getAdjacentAlgorithms } from './algorithms.js';
import { OVERVIEW_DATA } from './algo-overview-data.js';
import { ARTICLES_META } from './articles-meta.js';
// 注意：articles-data.js（~190KB 正文）、comics-data.js、article-engine.js、comic-engine.js
// 均通过 dynamic import() 懒加载，仅在用户真正触发时拉取，避免阻塞首屏。

export function renderNav(activeId) {
  const groups = groupByChapter();
  const active = ALGORITHMS.find(a => a.id === activeId);
  const activeChapterId = active ? active.chapter : null;

  const nav = document.createElement('nav');
  nav.className = 'sticky top-0 z-40 backdrop-blur bg-white/85 border-b border-brand-100 shadow-sm';
  nav.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
      <a href="../index.html" class="flex items-center gap-2 flex-shrink-0 group">
        <span class="text-2xl group-hover:rotate-12 transition-transform">🎮</span>
        <span class="font-bold text-base bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">图解强化学习</span>
      </a>
      <div class="nav-main">
        <a href="../index.html" class="nav-main-item">🏠 <span>首页</span></a>
        ${groups.map(g => {
          const hasMultiple = g.items.length > 1;
          const isActive = g.chapter.id === activeChapterId;
          if (!hasMultiple && g.items.length === 1) {
            // 只有一个子项：直接点击跳转，不展示下拉
            const only = g.items[0];
            return `
              <a href="../${only.page}" class="nav-main-item ${isActive ? 'active' : ''}" title="${g.chapter.title}">
                <span>${g.chapter.emoji}</span>
                <span>${chapterShort(g.chapter.title)}</span>
              </a>
            `;
          }
          return `
            <div class="nav-main-group ${isActive ? 'active' : ''}" tabindex="0">
              <span class="nav-main-item nav-main-trigger">
                <span>${g.chapter.emoji}</span>
                <span>${chapterShort(g.chapter.title)}</span>
                <span class="nav-caret">▾</span>
              </span>
              <div class="nav-dropdown">
                <div class="nav-dropdown-title">${g.chapter.emoji} ${g.chapter.title}</div>
                <div class="nav-dropdown-sub">${g.chapter.subtitle || ''}</div>
                <div class="nav-dropdown-items">
                  ${g.items.map(a => `
                    <a href="../${a.page}" class="nav-dropdown-item ${a.id === activeId ? 'active' : ''}">
                      <span class="nav-di-icon">${a.icon}</span>
                      <span class="nav-di-name">${a.name}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
        <a href="../pages/comics.html" class="nav-main-item nav-main-extra">
          <span>📖</span><span>漫画合集</span>
        </a>
      </div>
    </div>
  `;
  document.body.insertBefore(nav, document.body.firstChild);

  // 在标题下面自动插入"章节导读卡"（如果 active 算法存在）
  if (active) {
    renderChapterBreadcrumb(active);
    renderContextBanner(active);
    // 页脚之前自动挂载章节导航
    setTimeout(() => renderChapterNav(active), 0);
  }
}

// 章节标题简写（用于顶部导航，节省空间）
function chapterShort(title) {
  // "第一篇 · 走进强化学习" -> "走进强化学习"
  return title.replace(/^第[一二三四五六七八九十]+篇\s*·?\s*/, '').trim() || title;
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
      <p>图解强化学习 by xuefeng</p>
    </div>
  `;
  document.body.appendChild(footer);
}

/**
 * 渲染训练目标卡：说明这个环境在做什么、目标是什么、如何算作成功
 *
 * 插入策略（按优先级）：
 *   1. 显式传入 selector → 插入到该容器 innerHTML
 *   2. 页面内存在 #goal-slot 锚点 → 插入到该锚点（页面作者显式指定位置）
 *   3. 默认：插到 .page-desc 之后，作为"页面导读"紧贴描述，
 *      不打断下方任何 panel / grid（避免夹在控制按钮和结果展示之间）
 *
 * @param {string|null} selector 容器选择器，若为空则走自动插入逻辑
 * @param {{what:string, goal:string, success:string, metrics:string[], note?:string}} goal
 */
export function renderGoalCard(selector, goal) {
  // 说明：自 v2 起，本卡专注作为"交互说明书"
  //   - 原 what 字段已并入页面顶部紫色原理提示条，这里不再渲染（保留字段兼容旧调用）
  //   - 原 note 字段（章节过渡）已由顶部 context-banner 承担，这里也不再渲染
  //   - 仅保留 goal / success / metrics 这 3 块"跟交互直接相关"的内容
  const cardInner = `
    <div class="goal-card goal-card-v2">
      <div class="goal-row">
        <span class="goal-row-icon">🎯</span>
        <div class="goal-row-body"><b>这个 demo 让你调什么：</b>${goal.goal}</div>
      </div>
      <div class="goal-row">
        <span class="goal-row-icon">✅</span>
        <div class="goal-row-body"><b>什么现象说明有效：</b>${goal.success}</div>
      </div>
      ${goal.metrics?.length ? `
        <div class="goal-row">
          <span class="goal-row-icon">👀</span>
          <div class="goal-row-body">
            <b>重点观察这几个指标：</b>
            <ul class="goal-metrics-list">${goal.metrics.map(m => `<li>${m}</li>`).join('')}</ul>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  const wrapperHtml = `
    <section class="play-intro-wrap play-intro-wrap-v2">
      <div class="play-intro-header play-intro-header-v2">
        <span class="play-intro-emoji">📖</span>
        <span class="play-intro-title-text">交互说明 · 你在玩什么</span>
      </div>
      ${cardInner}
    </section>
  `;

  if (selector) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = wrapperHtml;
    return;
  }

  const container = document.querySelector('.page-container');
  if (!container) return;

  const wrap = document.createElement('div');
  wrap.innerHTML = wrapperHtml.trim();
  const node = wrap.firstElementChild;

  // 优先 1：#goal-slot（页面作者显式指定位置）
  const slot = container.querySelector('#goal-slot');
  if (slot) {
    slot.appendChild(node);
    return;
  }

  // 默认策略：插到 .page-desc 之后（作为"页面导读"，紧贴页面描述）
  // 之前尝试插到第一个交互 grid 前，但许多页面的交互按钮在架构图 panel 里，
  // 导致说明卡被夹在"控制按钮"和"结果展示"中间，把交互区截成两段。
  // 改为紧随 page-desc 之后，语义顺畅、不打断下方任何模块。
  const desc = container.querySelector('.page-desc');
  if (desc && desc.nextSibling) container.insertBefore(node, desc.nextSibling);
  else if (desc) container.appendChild(node);
  else container.insertBefore(node, container.firstChild);
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
  const article = ARTICLES_META[algoKey];
  let bannerHtml = '';
  if (article) {
    // 新版双版本长文
    const pMin = article.plain?.readMinutes || 5;
    const dMin = article.deep?.readMinutes || 15;
    bannerHtml = `
      <div class="read-first-banner" id="read-first-banner">
        <div class="rfb-left">
          <div class="rfb-emoji">📖</div>
          <div class="rfb-text">
            <div class="rfb-title">先 <span class="rfb-accent">了解一下原理</span>，再动手玩效果更好</div>
            <div class="rfb-sub">🍵 通俗版 约 <b>${pMin}</b> 分钟 · 📐 深入版 约 <b>${dMin}</b> 分钟 · <b>两版自由切换</b></div>
          </div>
        </div>
        <button class="rfb-cta" id="rfb-cta-btn" type="button">📖 开始阅读 →</button>
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

  // Banner 按钮 —— 点击时才懒加载正文数据与阅读引擎
  const bannerBtn = card.querySelector('#rfb-cta-btn');
  if (bannerBtn && article) {
    let loading = false;
    bannerBtn.addEventListener('click', async () => {
      if (loading) return;
      loading = true;
      const originalText = bannerBtn.textContent;
      bannerBtn.textContent = '📖 正在加载…';
      bannerBtn.disabled = true;
      try {
        const [{ ARTICLES }, { launchArticle }] = await Promise.all([
          import('./articles-data.js'),
          import('./article-engine.js'),
        ]);
        const full = ARTICLES[algoKey];
        if (full) launchArticle(full);
      } catch (err) {
        console.error('[renderAlgoOverview] 文章加载失败', err);
        alert('文章加载失败，请检查网络后重试');
      } finally {
        bannerBtn.textContent = originalText;
        bannerBtn.disabled = false;
        loading = false;
      }
    });
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