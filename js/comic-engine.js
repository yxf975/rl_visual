// 漫画引擎 v2：支持"长图阅读模式"（默认，一页读完）+ "逐格模式"（原有沉浸式翻页）
//
// 剧本结构（兼容旧数据）：
// {
//   title, chapter,
//   frames: [ { subtitle?, scene?, character?, side?, bubble?, narrator?, math?,
//               note?, warning?, compare?, extras?, bg?, poster? } ]
// }

/** 把 character 字段渲染为 HTML（支持 string emoji 或 {type:'img'} 对象） */
function renderCharacterHtml(character, mode) {
  if (!character) return '';
  if (typeof character === 'string') return character;
  if (typeof character === 'object' && character.type === 'img') {
    const alt = escapeAttr(character.alt || '角色插画');
    const src = character.src;
    const fb = character.fallback ? escapeAttr(character.fallback) : '🤖';
    const onerr = `this.onerror=null;var s=document.createElement('span');s.className='comic-fallback-emoji';s.textContent=this.dataset.fb;this.replaceWith(s);`;
    return `<img src="${src}" alt="${alt}" loading="lazy" data-fb="${fb}"
               class="comic-char-img"
               onerror="${onerr}"/>`;
  }
  return '';
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function collectImageSrcs(script) {
  const srcs = new Set();
  const pick = (v) => { if (v && typeof v === 'object' && v.type === 'img' && v.src) srcs.add(v.src); };
  for (const f of script.frames || []) { pick(f.character); pick(f.extras); }
  return [...srcs];
}

/**
 * 渲染单个 frame 的内部 HTML（不含外层容器）
 * 在两种模式中都会用到
 */
function renderFrameBody(f) {
  // poster 帧 —— 总结海报
  if (f.poster) {
    const bgStyle = f.bg ? `background:${f.bg};` : '';
    return `
      <div style="${bgStyle}" class="comic-poster-box">
        <div class="comic-poster-hero">${renderCharacterHtml(f.character || '🎉', 'poster')}</div>
        <div class="comic-poster-title">${f.poster.title}</div>
        <div class="comic-poster-slogan">${f.poster.slogan}</div>
        <div class="comic-poster-formula">
          <div class="comic-poster-formula-label">📐 核心公式</div>
          <div>${f.poster.formula}</div>
        </div>
        ${f.poster.cta ? `<a href="${f.poster.cta.href}" class="comic-btn inline-block mt-2" style="text-decoration:none;">${f.poster.cta.text}</a>` : ''}
      </div>
    `;
  }

  const bgStyle = f.bg ? `background:${f.bg};` : '';
  const sideClass = f.side === 'right' ? 'right' : 'left';
  let html = '';

  if (f.subtitle) {
    html += `<div style="display:flex;justify-content:center;"><div class="comic-subtitle">${f.subtitle}</div></div>`;
  }
  if (f.character || f.extras) {
    const extrasHtml = typeof f.extras === 'string' ? f.extras : renderCharacterHtml(f.extras, 'extras');
    html += `
      <div class="comic-illust" style="${bgStyle}">
        ${extrasHtml || ''}
        ${f.character ? `<div class="comic-character">${renderCharacterHtml(f.character, 'character')}</div>` : ''}
      </div>
    `;
  }
  if (f.narrator) html += `<div class="comic-bubble narrator">📝 ${f.narrator}</div>`;
  if (f.bubble) html += `<div class="comic-bubble ${sideClass}">${f.bubble}</div>`;
  if (f.math) html += `<div class="comic-math">${f.math}</div>`;
  if (f.compare) {
    html += `<div class="comic-compare">
      ${f.compare.map(c => `<div><b>${c.title}</b>${c.body}</div>`).join('')}
    </div>`;
  }
  if (f.note) html += `<div class="comic-note">${f.note}</div>`;
  if (f.warning) html += `<div class="comic-warning">${f.warning}</div>`;

  return html;
}

/** 从 frames 中抽取"章节锚点"：以 subtitle 为分界 */
function extractChapters(frames) {
  const chapters = [];
  frames.forEach((f, i) => {
    let title = null;
    if (f.subtitle) title = f.subtitle;
    else if (f.poster?.title) title = f.poster.title;
    if (title) chapters.push({ idx: i, title });
  });
  // 若完全没有 subtitle，退化为每 3 格一个锚点
  if (chapters.length === 0) {
    for (let i = 0; i < frames.length; i += 3) {
      chapters.push({ idx: i, title: `第 ${Math.floor(i / 3) + 1} 节` });
    }
  }
  return chapters;
}

/** ==================== 长图阅读模式（默认） ==================== */
function renderScrollMode(stage, script) {
  const chapters = extractChapters(script.frames);

  stage.innerHTML = `
    <div class="comic-panel scroll-mode">
      <div class="comic-header">
        <div class="flex-1 min-w-0">
          ${script.chapter ? `<div class="comic-chapter-label">${script.chapter}</div>` : ''}
          <div class="comic-title">📖 ${script.title}</div>
        </div>
        <div class="comic-mode-switch" title="切换阅读模式">
          <button class="mode-btn active" data-mode="scroll">📜 长文</button>
          <button class="mode-btn" data-mode="frame">🎞️ 逐格</button>
        </div>
        <button class="comic-close" aria-label="关闭">✕</button>
      </div>

      <div class="comic-toc-bar">
        ${chapters.map((c, i) => `
          <button class="toc-chip ${i === 0 ? 'active' : ''}" data-toc="${c.idx}">
            <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>${c.title}
          </button>
        `).join('')}
      </div>

      <div class="comic-scroll-body" id="comic-scroll-body">
        <div class="comic-scroll-intro">
          <div class="intro-badge">🎨 漫画精读</div>
          <div class="intro-hint">共 <b>${script.frames.length}</b> 格 · 约 <b>${Math.max(2, Math.round(script.frames.length * 0.4))}</b> 分钟读完 · 滚动即可阅读，无需点击</div>
        </div>
        ${script.frames.map((f, i) => `
          <article class="comic-frame-block ${f.poster ? 'is-poster' : ''}" data-frame="${i}" id="frame-${i}">
            <div class="frame-index">${String(i + 1).padStart(2, '0')} / ${script.frames.length}</div>
            ${renderFrameBody(f)}
          </article>
        `).join('')}
        <div class="comic-scroll-footer">
          <div class="footer-emoji">🎉</div>
          <div class="footer-title">读完啦！</div>
          <div class="footer-hint">现在你已经建立了直觉，关闭本窗口，去下方的"动手玩"区域亲自验证一下吧。</div>
          <button class="footer-btn" id="comic-close-footer">✕ 关闭，开始动手实践</button>
        </div>
      </div>

      <div class="comic-scroll-progress">
        <div class="comic-scroll-progress-bar" id="comic-scroll-bar"></div>
      </div>
    </div>
  `;

  const body = stage.querySelector('#comic-scroll-body');
  const bar = stage.querySelector('#comic-scroll-bar');
  const tocChips = stage.querySelectorAll('.toc-chip');

  // 滚动 -> 进度条 & 激活当前章节
  const updateOnScroll = () => {
    const st = body.scrollTop;
    const max = body.scrollHeight - body.clientHeight;
    const pct = max > 0 ? Math.min(100, (st / max) * 100) : 100;
    bar.style.width = pct + '%';

    // 找到当前视口内最靠上的 frame-block
    const blocks = body.querySelectorAll('.comic-frame-block');
    let currentIdx = 0;
    const threshold = 120; // 离顶部 120px 内视为"当前"
    for (let i = 0; i < blocks.length; i++) {
      const rect = blocks[i].getBoundingClientRect();
      const parentRect = body.getBoundingClientRect();
      if (rect.top - parentRect.top <= threshold) currentIdx = i;
      else break;
    }
    // 激活最接近的章节 chip
    let activeChipIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].idx <= currentIdx) activeChipIdx = i;
      else break;
    }
    tocChips.forEach((c, i) => c.classList.toggle('active', i === activeChipIdx));
    // 把激活的 chip 滚到中间
    const activeChip = tocChips[activeChipIdx];
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };
  body.addEventListener('scroll', updateOnScroll);

  // 章节跳转
  tocChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const idx = +chip.dataset.toc;
      const target = body.querySelector(`#frame-${idx}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 模式切换
  stage.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'frame') renderFrameMode(stage, script);
    });
  });

  // 关闭
  const close = () => { stage.remove(); document.removeEventListener('keydown', keyHandler); };
  stage.querySelector('.comic-close').addEventListener('click', close);
  stage.querySelector('#comic-close-footer')?.addEventListener('click', close);
  stage.addEventListener('click', e => { if (e.target === stage) close(); });

  function keyHandler(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Home') { e.preventDefault(); body.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.key === 'End') { e.preventDefault(); body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' }); }
  }
  document.addEventListener('keydown', keyHandler);

  // 首次触发进度更新
  requestAnimationFrame(updateOnScroll);
}

/** ==================== 逐格模式（保留原体验） ==================== */
function renderFrameMode(stage, script) {
  stage.innerHTML = `
    <div class="comic-panel frame-mode">
      <div class="comic-header">
        <div class="flex-1 min-w-0">
          ${script.chapter ? `<div class="comic-chapter-label">${script.chapter}</div>` : ''}
          <div class="comic-title">📖 ${script.title}</div>
        </div>
        <div class="comic-mode-switch" title="切换阅读模式">
          <button class="mode-btn" data-mode="scroll">📜 长文</button>
          <button class="mode-btn active" data-mode="frame">🎞️ 逐格</button>
        </div>
        <button class="comic-close" aria-label="关闭">✕</button>
      </div>
      <div class="comic-scene" id="comic-scene"></div>
      <div class="comic-nav">
        <button class="comic-btn" id="comic-prev">◀ 上一格</button>
        <div class="comic-progress"><div class="comic-progress-bar" id="comic-bar"></div></div>
        <span class="comic-counter" id="comic-counter">1 / ${script.frames.length}</span>
        <button class="comic-btn" id="comic-next">下一格 ▶</button>
      </div>
    </div>
  `;

  let idx = 0;
  const sceneBox = stage.querySelector('#comic-scene');
  const bar = stage.querySelector('#comic-bar');
  const counter = stage.querySelector('#comic-counter');
  const prevBtn = stage.querySelector('#comic-prev');
  const nextBtn = stage.querySelector('#comic-next');

  function render() {
    const f = script.frames[idx];
    sceneBox.innerHTML = renderFrameBody(f);
    bar.style.width = `${((idx + 1) / script.frames.length) * 100}%`;
    counter.textContent = `${idx + 1} / ${script.frames.length}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === script.frames.length - 1;
    sceneBox.scrollTop = 0;
  }
  render();

  const next = () => { if (idx < script.frames.length - 1) { idx++; render(); } };
  const prev = () => { if (idx > 0) { idx--; render(); } };
  const close = () => { stage.remove(); document.removeEventListener('keydown', keyHandler); };

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  stage.querySelector('.comic-close').addEventListener('click', close);
  stage.addEventListener('click', e => { if (e.target === stage) close(); });

  stage.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'scroll') renderScrollMode(stage, script);
    });
  });

  function keyHandler(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', keyHandler);
}

/** ==================== 对外 API ==================== */
export function launchComic(script, opts = {}) {
  // 移除已有
  document.querySelectorAll('.comic-stage').forEach(el => el.remove());

  // 预加载所有图片
  collectImageSrcs(script).forEach(src => { const im = new Image(); im.src = src; });

  const stage = document.createElement('div');
  stage.className = 'comic-stage';
  document.body.appendChild(stage);

  // 默认用长图模式
  const mode = opts.mode || 'scroll';
  if (mode === 'frame') renderFrameMode(stage, script);
  else renderScrollMode(stage, script);
}

/**
 * 已废弃：保留空实现以兼容旧调用，不再挂载悬浮按钮
 * 现在漫画入口统一由算法页顶部的 "📖 精读漫画" banner 触发
 */
export function mountComicButton(_script) {
  // no-op（入口改为顶部 banner，避免双重入口）
}
