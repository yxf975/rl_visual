// 文章引擎（article-engine.js）
//
// 渲染双版本长文：
//   - plain：娓娓道来的散文（零公式）
//   - deep ：严谨结构化的技术文档（含 LaTeX 公式、伪代码、对比表）
//
// 对外 API：
//   launchArticle(article, opts?)   直接打开
//
// UI 流程：
//   ① 入口选择页：两个大按钮（通俗理解 / 深入学习）
//   ② 进入后的阅读页：顶部 Tab 可随时切换两个版本
//
// KaTeX 按需加载（只在进入 deep 版时加载，节省首屏开销）

const KATEX_CSS_URL = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
const KATEX_JS_URL  = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
const KATEX_AUTO_URL= 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';

// 自动注入 article.css（相对当前模块路径解析，兼容 /pages/ 子目录）
(function ensureArticleCss() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-article-css]')) return;
  try {
    const href = new URL('../css/article.css', import.meta.url).href;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-article-css', '1');
    document.head.appendChild(link);
  } catch (_) {
    // 兜底：直接用相对路径（仅在根目录 HTML 中生效）
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/article.css';
    link.setAttribute('data-article-css', '1');
    document.head.appendChild(link);
  }
})();

let _katexLoading = null;
function ensureKatex() {
  if (window.katex && window.renderMathInElement) return Promise.resolve();
  if (_katexLoading) return _katexLoading;
  _katexLoading = new Promise((resolve) => {
    // CSS
    if (!document.querySelector(`link[data-katex]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = KATEX_CSS_URL;
      link.setAttribute('data-katex', '1');
      document.head.appendChild(link);
    }
    // JS
    const s1 = document.createElement('script');
    s1.src = KATEX_JS_URL;
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = KATEX_AUTO_URL;
      s2.onload = () => resolve();
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
  return _katexLoading;
}

function renderMath(root) {
  if (!window.renderMathInElement) return;
  try {
    window.renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true  },
        { left: '$',  right: '$',  display: false },
      ],
      throwOnError: false,
      errorColor: '#ef4444',
      strict: 'ignore',
    });
  } catch (_) {}
}

// ============== 工具 ==============
function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// 段落内可保留基本富文本（<b>/<i>/<code>/<br>）
function sanitizeInline(html) {
  // 粗放但可控：只允许我们使用的标签
  return String(html ?? '');
}

// ============== 块渲染 ==============
function renderPlainBlock(b) {
  switch (b.type) {
    case 'h2':
      return `<h2 class="art-h2">${sanitizeInline(b.text)}</h2>`;
    case 'p':
      return `<p class="art-p">${sanitizeInline(b.text)}</p>`;
    case 'quote':
      return `<blockquote class="art-quote">
        <div>${sanitizeInline(b.text)}</div>
        ${b.from ? `<footer>—— ${escHtml(b.from)}</footer>` : ''}
      </blockquote>`;
    case 'hr-quote':
      return `<div class="art-hr-quote">
        <div class="art-hr-quote-mark">&ldquo;</div>
        <div class="art-hr-quote-text">${sanitizeInline(b.text)}</div>
      </div>`;
    case 'callout': {
      const tone = b.tone || 'tip';
      const icon = b.icon || ({ tip: '💡', warn: '⚠️', note: '📝' }[tone] || '💡');
      return `<div class="art-callout art-callout-${tone}">
        <div class="art-callout-icon">${icon}</div>
        <div class="art-callout-body">${sanitizeInline(b.text)}</div>
      </div>`;
    }
    case 'divider':
      return `<div class="art-divider"><span>✦</span></div>`;
    case 'image': {
      const fb = b.fallback ? escHtml(b.fallback) : '🎨';
      const cap = b.caption ? `<div class="art-image-cap">${escHtml(b.caption)}</div>` : '';
      const onerr = `this.onerror=null;var s=document.createElement('span');s.className='art-image-fallback';s.textContent=this.dataset.fb;this.replaceWith(s);`;
      return `<figure class="art-figure">
        <img src="${b.src}" alt="${escHtml(b.caption || '插图')}" loading="lazy" data-fb="${fb}" class="art-image" onerror="${onerr}"/>
        ${cap}
      </figure>`;
    }
    default:
      return '';
  }
}

function renderDeepBlock(b) {
  switch (b.type) {
    case 'h2':
      return `<h2 class="art-h2 deep" ${b.anchor ? `id="sec-${escHtml(b.anchor)}"` : ''}>${sanitizeInline(b.text)}</h2>`;
    case 'h3':
      return `<h3 class="art-h3">${sanitizeInline(b.text)}</h3>`;
    case 'p':
      return `<p class="art-p">${sanitizeInline(b.text)}</p>`;
    case 'math':
      return `<div class="art-math-block">$$${b.tex}$$ ${b.label ? `<span class="art-math-label">(${escHtml(b.label)})</span>` : ''}</div>`;
    case 'derivation':
      return `<ol class="art-derivation">
        ${b.steps.map(s => `
          <li>
            ${s.note ? `<div class="art-deriv-note">${sanitizeInline(s.note)}</div>` : ''}
            <div class="art-deriv-math">$$${s.tex}$$</div>
          </li>
        `).join('')}
      </ol>`;
    case 'pseudocode':
      return `<div class="art-pseudo">
        <div class="art-pseudo-head">
          <span class="art-pseudo-badge">PSEUDOCODE</span>
          <span class="art-pseudo-title">${escHtml(b.title || 'Algorithm')}</span>
        </div>
        <pre class="art-pseudo-body"><code>${b.lines.map(l => escHtml(l)).join('\n')}</code></pre>
      </div>`;
    case 'table':
      return `<div class="art-table-wrap"><table class="art-table">
        <thead><tr>${b.headers.map(h => `<th>${sanitizeInline(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${sanitizeInline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    case 'callout': {
      const tone = b.tone || 'note';
      const icon = b.icon || ({ tip: '💡', warn: '⚠️', note: '📝' }[tone] || '📝');
      return `<div class="art-callout art-callout-${tone}">
        <div class="art-callout-icon">${icon}</div>
        <div class="art-callout-body">${sanitizeInline(b.text)}</div>
      </div>`;
    }
    case 'list':
      return `<ul class="art-list">${b.items.map(i => `<li>${sanitizeInline(i)}</li>`).join('')}</ul>`;
    case 'olist':
      return `<ol class="art-olist">${b.items.map(i => `<li>${sanitizeInline(i)}</li>`).join('')}</ol>`;
    case 'references':
      return `<ol class="art-refs">
        ${b.items.map(r => `<li>${r.url ? `<a href="${escHtml(r.url)}" target="_blank" rel="noopener">${escHtml(r.title)}</a>` : escHtml(r.title)}</li>`).join('')}
      </ol>`;
    default:
      return '';
  }
}

// 从 blocks 中提取章节锚点（h2 with anchor 或 plain 的 h2）
function extractTOC(blocks, mode) {
  const list = [];
  blocks.forEach((b, i) => {
    if (b.type === 'h2') {
      list.push({
        idx: i,
        text: String(b.text).replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, ''),
        anchor: b.anchor || `sec-${mode}-${i}`,
      });
    }
  });
  return list;
}

// ============== 视图：入口选择页 ==============
function renderChooser(stage, article) {
  const p = article.plain, d = article.deep;
  stage.innerHTML = `
    <div class="art-panel chooser-mode">
      <button class="art-close" aria-label="关闭">✕</button>
      <div class="art-chooser">
        <div class="art-chooser-head">
          <div class="art-chooser-icon">${article.icon || '📖'}</div>
          <h1 class="art-chooser-title">${escHtml(article.title)}</h1>
          ${article.subtitle ? `<p class="art-chooser-sub">${escHtml(article.subtitle)}</p>` : ''}
        </div>
        <div class="art-chooser-grid">
          <button class="art-choice art-choice-plain" data-mode="plain">
            <div class="art-choice-emoji">🍵</div>
            <div class="art-choice-main">
              <div class="art-choice-label">通俗理解? 点这里</div>
              <div class="art-choice-sub">不含公式，把原理讲清楚</div>
              ${p ? `<div class="art-choice-meta">约 ${p.readMinutes || 5} 分钟 · ${p.blocks.length} 段</div>` : ''}
            </div>
            <div class="art-choice-arrow">→</div>
          </button>
          <button class="art-choice art-choice-deep" data-mode="deep">
            <div class="art-choice-emoji">📐</div>
            <div class="art-choice-main">
              <div class="art-choice-label">深入学习? 点这里</div>
              <div class="art-choice-sub">含公式推导、伪代码、工程细节</div>
              ${d ? `<div class="art-choice-meta">约 ${d.readMinutes || 12} 分钟 · ${d.blocks.length} 段</div>` : ''}
            </div>
            <div class="art-choice-arrow">→</div>
          </button>
        </div>
        <div class="art-chooser-hint">进入后，顶部随时可以切换 · 支持键盘 ESC 关闭</div>
      </div>
    </div>
  `;
  stage.querySelectorAll('.art-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      renderReader(stage, article, mode);
    });
  });
  stage.querySelector('.art-close').addEventListener('click', () => closeStage(stage));
  stage.addEventListener('click', e => { if (e.target === stage) closeStage(stage); });
  _installKeyHandler(stage);
}

// ============== 视图：阅读页 ==============
function renderReader(stage, article, mode) {
  const version = article[mode];
  if (!version) {
    console.warn(`[article-engine] 缺失 ${mode} 版本`);
    return renderChooser(stage, article);
  }
  const toc = extractTOC(version.blocks, mode);
  const renderBlock = mode === 'plain' ? renderPlainBlock : renderDeepBlock;

  stage.innerHTML = `
    <div class="art-panel reader-mode art-mode-${mode}">
      <header class="art-header">
        <div class="art-header-left">
          <div class="art-header-icon">${article.icon || '📖'}</div>
          <div>
            <div class="art-header-title">${escHtml(article.title)}</div>
            <div class="art-header-sub">${mode === 'plain' ? '🍵 通俗理解版' : '📐 深入学习版'} · 约 ${version.readMinutes} 分钟</div>
          </div>
        </div>
        <div class="art-tabs">
          <button class="art-tab ${mode === 'plain' ? 'active' : ''}" data-mode="plain">🍵 通俗理解</button>
          <button class="art-tab ${mode === 'deep' ? 'active' : ''}"  data-mode="deep">📐 深入学习</button>
        </div>
        <button class="art-close" aria-label="关闭">✕</button>
      </header>

      <div class="art-body-wrap ${toc.length >= 2 ? 'has-toc' : 'no-toc'}">
        ${toc.length >= 2 ? `
          <aside class="art-toc">
            <div class="art-toc-title">📑 目录</div>
            <ul>
              ${toc.map((t, i) => `<li><a href="#" data-toc="${t.anchor}">${String(i + 1).padStart(2, '0')}. ${escHtml(t.text)}</a></li>`).join('')}
            </ul>
          </aside>
        ` : ''}
        <main class="art-body" id="art-body">
          <div class="art-intro">
            <div class="art-intro-badge">${mode === 'plain' ? '🍵 通俗理解版' : '📐 深入学习版'}</div>
            <h1 class="art-intro-title">${escHtml(article.title)}</h1>
            ${article.subtitle ? `<p class="art-intro-sub">${escHtml(article.subtitle)}</p>` : ''}
            <div class="art-intro-meta">
              <span>⏱️ 约 ${version.readMinutes} 分钟</span>
              <span>·</span>
              <span>${mode === 'plain' ? '本版不含数学公式' : '包含公式推导与伪代码'}</span>
            </div>
          </div>
          ${version.blocks.map((b, i) => {
            // 给 h2 补 anchor id（plain 模式）
            if (b.type === 'h2' && !b.anchor && mode === 'plain') {
              return `<h2 class="art-h2" id="sec-${mode}-${i}">${sanitizeInline(b.text)}</h2>`;
            }
            return renderBlock(b);
          }).join('')}
          <div class="art-footer">
            <div class="art-footer-emoji">${mode === 'plain' ? '🌱' : '🎓'}</div>
            <div class="art-footer-title">${mode === 'plain' ? '读完啦！建立直觉了吗？' : '读完啦！准备动手实现？'}</div>
            <div class="art-footer-hint">${mode === 'plain' ? '现在可以去下方的"动手玩"区域亲自验证一下，或者切到"深入学习"看完整推导。' : '公式和伪代码已经在你手边，剩下就是代码了。'}</div>
            <div class="art-footer-actions">
              ${mode === 'plain'
                ? `<button class="art-footer-btn primary" data-jump="deep">📐 进阶到"深入学习"</button>`
                : `<button class="art-footer-btn" data-jump="plain">🍵 回到"通俗理解"</button>`
              }
              <button class="art-footer-btn" id="art-close-footer">✕ 关闭，开始动手实践</button>
            </div>
          </div>
        </main>
      </div>

      <div class="art-progress"><div class="art-progress-bar" id="art-progress-bar"></div></div>
    </div>
  `;

  const body = stage.querySelector('#art-body');
  const bar = stage.querySelector('#art-progress-bar');

  // 滚动进度
  const onScroll = () => {
    const st = body.scrollTop;
    const max = body.scrollHeight - body.clientHeight;
    const pct = max > 0 ? Math.min(100, (st / max) * 100) : 100;
    bar.style.width = pct + '%';

    // TOC 活动项高亮
    const headings = body.querySelectorAll('h2.art-h2');
    const parentTop = body.getBoundingClientRect().top;
    let activeIdx = 0;
    headings.forEach((h, i) => {
      const top = h.getBoundingClientRect().top - parentTop;
      if (top <= 100) activeIdx = i;
    });
    stage.querySelectorAll('.art-toc a').forEach((a, i) => {
      a.classList.toggle('active', i === activeIdx);
    });
  };
  body.addEventListener('scroll', onScroll);

  // TOC 点击
  stage.querySelectorAll('.art-toc a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const anchor = a.dataset.toc;
      const target = body.querySelector(`#${CSS.escape(anchor)}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Tab 切换
  stage.querySelectorAll('.art-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const newMode = btn.dataset.mode;
      if (newMode !== mode) renderReader(stage, article, newMode);
    });
  });

  // Footer 跳转
  stage.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      renderReader(stage, article, btn.dataset.jump);
    });
  });

  // 关闭
  stage.querySelector('.art-close').addEventListener('click', () => closeStage(stage));
  stage.querySelector('#art-close-footer')?.addEventListener('click', () => closeStage(stage));
  stage.addEventListener('click', e => { if (e.target === stage) closeStage(stage); });
  _installKeyHandler(stage, body);

  // 首次进度更新
  requestAnimationFrame(onScroll);

  // 深度版需要 KaTeX 渲染
  if (mode === 'deep') {
    ensureKatex().then(() => renderMath(body));
  }
}

// ============== 辅助 ==============
let _currentKeyHandler = null;
function _installKeyHandler(stage, body) {
  if (_currentKeyHandler) document.removeEventListener('keydown', _currentKeyHandler);
  const fn = (e) => {
    if (e.key === 'Escape') closeStage(stage);
    if (body) {
      if (e.key === 'Home') { e.preventDefault(); body.scrollTo({ top: 0, behavior: 'smooth' }); }
      if (e.key === 'End')  { e.preventDefault(); body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' }); }
    }
  };
  _currentKeyHandler = fn;
  document.addEventListener('keydown', fn);
}
function closeStage(stage) {
  stage.remove();
  if (_currentKeyHandler) {
    document.removeEventListener('keydown', _currentKeyHandler);
    _currentKeyHandler = null;
  }
}

// ============== 对外 API ==============
/**
 * 打开文章阅读器
 * @param {object} article  { title, subtitle, icon, plain, deep }
 * @param {object} opts
 *   opts.initialMode?  'chooser' | 'plain' | 'deep'  —— 直接进入某版本；默认 'chooser'
 */
export function launchArticle(article, opts = {}) {
  document.querySelectorAll('.art-stage').forEach(el => el.remove());
  const stage = document.createElement('div');
  stage.className = 'art-stage';
  document.body.appendChild(stage);

  const mode = opts.initialMode || 'chooser';
  if (mode === 'chooser') renderChooser(stage, article);
  else renderReader(stage, article, mode);
}

/**
 * 判断一个数据对象是否是新版 Article 格式
 */
export function isArticle(obj) {
  return !!(obj && (obj.plain || obj.deep) && Array.isArray((obj.plain || obj.deep).blocks));
}