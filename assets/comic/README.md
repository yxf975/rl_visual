# 🎨 漫画系列配图 · 进度清单

本目录原计划存放下载到本地的漫画 AI 插画。
目前采用**远程 URL 方案**：所有图片已生成并托管于腾讯云 COS，通过 [`js/img-assets.js`](../../js/img-assets.js) 统一管理，
[`js/comic-engine.js`](../../js/comic-engine.js) 原生支持图片对象（带 fallback emoji），加载失败时自动降级。

若未来要把远程资源迁移到本地，只需把图片下载到本目录并修改 `img-assets.js` 的 URL 即可，**其它代码无需改动**。

---

## 🎯 风格规范（强制）

- **主角**：萌系学习型机器人 —— 圆形白色身体、大眼睛、胸前紫色能量核心、鼠尾草绿耳机、粉色关节
- **画风**：扁平 2D 卡通 + 轻微厚涂，线条干净
- **色彩**：低饱和度 · 柔和莫兰迪 · 素雅但通透
  - ✅ 允许：柔紫、浅粉、鼠尾草绿、暖沙色、奶油米
  - ❌ 禁用：霓虹、荧光、高饱和度的纯红/蓝/黄、脏污/泥土色
- **背景**：奶油渐变、雾霾灰、米色，不喧宾夺主
- **线稿色**：深棕灰（非纯黑）

## 📐 标准 Prompt 模板

```
[风格前缀·固定]：A 2D flat cartoon illustration in muted Morandi color palette,
low saturation, soft pastel tones (dusty purple, warm beige, sage green, powder pink),
consistent with the reference character (round white robot with big eyes and purple core),
clean line art, no neon colors, no high-saturation primaries, gentle gradient background.

[场景增量·本张]：{具体场景/动作/道具描述}

[负向词]：no neon, no fluorescent colors, no dirty artifacts, no text/watermark,
no realistic photo style, no cyberpunk.
```

---

## ✅ 已生成清单

### Step 1 · 锚点图（风格基准 / 所有后续图的"垫图"）

- [x] `robot-anchor` — 萌系机器人正面全身肖像 ✨

### Step 2 · 通用角色表情包（P0 · 核心情绪）

- [x] `happy` — 开心眯眼笑（替换原 😊 / 部分 🤖）
- [x] `thinking` — 托腮思考（替换原 🤔 / 💭）
- [x] `surprised` — 吃惊瞪眼（替换原 😲 / 😮 / 😱 / 💥 / 🚨）
- [x] `cheer` — 举手欢呼（替换所有海报帧 🎉 / 🎊 / 🏆 / 🏅 / 🌟）
- [x] `confused` — 歪头疑惑（替换原 🤨 / ❓ / 😵‍💫）
- [x] `fighting` — 戴头巾握拳（替换原 💪 / 😤）
- [x] `sad` — 沮丧流泪（替换原 😔 / 😩 / 😣 / 😵）
- [x] `idea` — 头顶灯泡（替换原 💡）

### Step 3 · 算法专属场景图（P1 · 已生成 2 张示例）

- [x] `banditCasino` — 多臂老虎机·赌场场景（用于 bandit 首格）
- [x] `mdpMaze` — 4×4 网格迷宫俯视图（用于 mdp "认识机器人小马"帧）
- [ ] `dp-heatmap` · `dp-policy-arrows` — 动态规划
- [ ] `td-cliff` · `td-two-robots` — 时序差分
- [ ] `dqn-replay` · `dqn-twins` — 深度 Q 网络
- [ ] `ac-stage` — Actor-Critic 演员登台
- [ ] `trpo-safezone` — TRPO 信赖域安全圈
- [ ] `ppo-clip` — PPO 剪刀
- [ ] `ddpg-robotarm` · `ddpg-target` — DDPG 机械臂/追踪
- [ ] `llm-alignment` · `llm-pipeline` · `llm-balance` — LLM 对齐

---

## 📊 覆盖统计

| 漫画 | 关键情绪帧 | 已替换 | 覆盖率 |
|---|---|---|---|
| bandit | 4 | 4 | 100% |
| mdp | 2 | 2 | 100% |
| dp | 3 | 3 | 100% |
| td | 2 | 2 | 100% |
| dqn | 4 | 4 | 100% |
| reinforce | 3 | 3 | 100% |
| ac | 4 | 4 | 100% |
| trpo | 4 | 4 | 100% |
| ppo | 3 | 3 | 100% |
| ddpg | 4 | 4 | 100% |
| llm | 7 | 7 | 100% |
| **合计** | **40** | **40** | **100%** |

---

## ⚙️ 技术实现

### 图片对象结构

```js
// js/img-assets.js
const img = (src, fallback, alt) => ({ type: 'img', src, fallback, alt });

export const IMG = {
  happy:     img('https://.../xxx.png', '😊', '开心微笑的机器人'),
  thinking:  img('https://.../yyy.png', '🤔', '托腮思考的机器人'),
  // ...
};
```

### 引擎支持（无需改造）

`js/comic-engine.js` 的 `renderCharacterHtml()` 已原生支持：
- 字符串 emoji → 直接嵌入
- `{ type:'img', src, alt, fallback }` → 渲染 `<img>`，`onerror` 自动降级到 fallback emoji
- 所有图片启用 `loading="lazy"`

### 在 comics-data.js 中使用

```js
import { IMG } from './img-assets.js';

export const COMICS = {
  bandit: {
    frames: [
      { character: IMG.banditCasino, narrator: '...' },   // 图片
      { character: IMG.thinking,     narrator: '...' },   // 图片
      { character: '📊',              narrator: '...' },   // emoji（兼容）
    ]
  }
};
```

---

## 🎨 校验页

访问 [`../../pages/comic-gallery.html`](../../pages/comic-gallery.html) 可平铺检视所有已生成的插画，
发现不合格的可单独标记并基于锚点图重新生成。
