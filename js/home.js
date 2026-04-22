// 首页：按章节层次渲染
import { ALGORITHMS, CHAPTERS, CHAPTER_BRIDGES, groupByChapter } from './algorithms.js';

const root = document.getElementById('chapters-root');
if (root) {
  const groups = groupByChapter();
  root.innerHTML = groups.map((g, idx) => {
    const ch = g.chapter;
    const items = g.items;
    return `
      <section class="chapter-section" data-chapter="${ch.id}">
        <div class="chapter-header bg-gradient-to-r ${ch.color}">
          <div class="flex items-start gap-4 flex-wrap">
            <div class="chapter-emoji">${ch.emoji}</div>
            <div class="flex-1 min-w-[240px]">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="chapter-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="badge-${ch.badge}" style="font-size:0.7rem;padding:0.15rem 0.6rem;">${ch.badge}</span>
                <span class="text-xs text-gray-500">· ${items.length} 个章节</span>
              </div>
              <h2 class="chapter-title">${ch.title}</h2>
              <p class="chapter-subtitle">${ch.subtitle}</p>
              <p class="chapter-desc">${ch.desc}</p>
            </div>
          </div>
        </div>
        <div class="chapter-items">
          ${items.map((a, i) => `
            <a href="${a.page}" class="algo-row">
              <div class="algo-row-index">${i + 1}</div>
              <div class="algo-row-icon">${a.icon}</div>
              <div class="algo-row-main">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="algo-row-title">${a.name}</h3>
                  <span class="badge-${a.level}" style="font-size:0.6rem;padding:0.1rem 0.45rem;">${a.level}</span>
                </div>
                <p class="algo-row-desc">${a.desc}</p>
                <div class="algo-row-meta">
                  <span class="meta-item">📌 <b>前置：</b>${a.prereq}</span>
                  <span class="meta-item">🎯 <b>你将学会：</b>${a.takeaway}</span>
                </div>
                <div class="algo-row-tags">
                  ${a.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
              </div>
              <div class="algo-row-arrow">→</div>
            </a>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

// 学习路径时间线（按章节，带过渡文案）
const pathEl = document.getElementById('learning-path');
if (pathEl) {
  // 把 "第X篇 · " 前缀剥掉，只留主标题
  const stripPrefix = (title) => title.replace(/^第.{1,3}篇\s*·\s*/, '');

  pathEl.innerHTML = CHAPTERS.map((ch, i) => {
    const bridge = (i < CHAPTERS.length - 1) ? (CHAPTER_BRIDGES[i] || '→') : null;
    return `
      <div class="path-node" data-goto="${ch.id}">
        <div class="path-circle">${ch.emoji}</div>
        <div class="path-label">
          <div class="path-num">篇 ${i + 1}</div>
          <div class="path-title">${stripPrefix(ch.title)}</div>
        </div>
      </div>
      ${bridge ? `
        <div class="path-bridge">
          <div class="path-bridge-arrow">→</div>
          <div class="path-bridge-text">${bridge}</div>
        </div>
      ` : ''}
    `;
  }).join('');

  pathEl.querySelectorAll('.path-node').forEach(n => {
    n.addEventListener('click', () => {
      const id = n.dataset.goto;
      document.querySelector(`[data-chapter="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
