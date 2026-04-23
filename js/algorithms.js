// 算法元数据 + 章节层次化结构（供首页/导航/漫画合集使用）
// chapter: 所属篇章ID； order: 在篇章内的顺序
//
// 当前采用"5 篇结构（方案 B）"：
//   c1 · 走进强化学习     —— 初探 RL + 多臂老虎机
//   c2 · 强化学习的数学语言 —— MDP 独立成篇
//   c3 · 经典求解方法     —— DP + TD + DQN
//   c4 · 策略优化算法进阶   —— REINFORCE + AC + TRPO + PPO + DDPG
//   c5 · 大语言模型对齐    —— LLM RL

export const CHAPTERS = [
  {
    id: 'c1', title: '第一篇 · 走进强化学习', emoji: '🌱',
    subtitle: '从零开始建立直觉：智能体、环境、奖励与最朴素的试错学习',
    desc: '如果你从未听说过强化学习，请从这里开始。先用一张大图认清 RL 全貌，再用赌场老虎机体会"探索 vs 利用"这颗最小的种子。',
    color: 'from-green-100 to-lime-100', badge: '入门',
  },
  {
    id: 'c2', title: '第二篇 · 强化学习的数学语言', emoji: '🗺️',
    subtitle: '从老虎机加回"状态"，得到描述一切 RL 问题的统一框架',
    desc: 'MDP 不是"方法"，而是我们用来描述一切决策问题的数学模板。掌握了它，后面每个算法都只是 MDP 的一种解法。',
    color: 'from-blue-100 to-indigo-100', badge: '入门',
  },
  {
    id: 'c3', title: '第三篇 · 经典求解方法', emoji: '📐',
    subtitle: '从精确计算到采样学习，再到神经网络近似',
    desc: '在 MDP 框架里，我们有三条解路：知道模型就用 DP 精确解，不知道模型就 TD 边走边学，状态太多就上神经网络变成 DQN。',
    color: 'from-purple-100 to-pink-100', badge: '入门',
  },
  {
    id: 'c4', title: '第四篇 · 策略优化算法进阶', emoji: '🎭',
    subtitle: '不再学"价值"，直接优化"策略"——从基础到工业级',
    desc: 'REINFORCE 最朴素 → Actor-Critic 降方差 → TRPO 保稳定 → PPO 成工业标准 → DDPG 把策略扩到连续动作。一条完整的策略优化演进线。',
    color: 'from-pink-100 to-orange-100', badge: '进阶',
  },
  {
    id: 'c5', title: '第五篇 · 大语言模型对齐', emoji: '✨',
    subtitle: 'ChatGPT 为什么"懂礼貌"？背后是 RL 在发力',
    desc: 'RLHF / DPO / GRPO —— 用人类偏好代替奖励函数，把 RL 算法应用到万亿参数大模型，这是 2023 年以来最火热的前沿方向。',
    color: 'from-fuchsia-100 to-violet-100', badge: '前沿',
  },
];

// 篇章间过渡逻辑：渲染首页学习路径时使用
export const CHAPTER_BRIDGES = [
  '从简化问题 → 完整框架',
  '有了问题描述 → 如何求解？',
  '换一条路 → 直接优化策略',
  'RL 最新应用 → 大模型对齐',
];

export const ALGORITHMS = [
  // ===== 第一篇 · 走进强化学习 =====
  {
    id: 'intro', icon: '🌱', name: '初探强化学习',
    desc: '一张大图看懂 RL：智能体、环境、奖励、策略的交互循环',
    tags: ['导论', '核心概念', '学习路径'],
    level: '入门', chapter: 'c1', order: 1,
    page: 'pages/intro.html',
    prereq: '无需任何前置知识，好奇心就够了',
    takeaway: '建立对强化学习的整体直觉，知道它和监督/无监督学习的本质差异',
    positioning: '你听说过 RL 吗？让我们从零开始建立直觉',
    nextHint: '接下来用一个最简化的问题 —— 多臂老虎机，体会试错学习',
  },
  {
    id: 'bandit', icon: '🎰', name: '多臂老虎机',
    desc: '简化问题 · 无状态：引出"探索 vs 利用"这一 RL 最小种子',
    tags: ['ε-贪心', 'UCB', 'Thompson', '简化问题'],
    level: '入门', chapter: 'c1', order: 2,
    page: 'pages/bandit.html',
    prereq: '初探 RL（建立基本直觉）',
    takeaway: '明白"试错学习"的两难：想赚更多，必须有时候放弃看起来最好的选项',
    positioning: '强化学习最简化的版本：只有动作和奖励，没有状态转移',
    nextHint: '现实问题不只有动作和奖励 —— 还有状态，下一章加回状态得到完整 RL 框架：MDP',
  },

  // ===== 第二篇 · 强化学习的数学语言 =====
  {
    id: 'mdp', icon: '🗺️', name: 'MDP 马尔可夫决策过程',
    desc: 'RL 的统一数学语言：五元组 <S,A,P,R,γ> 描述一切决策问题',
    tags: ['状态转移', '价值函数', 'Bellman'],
    level: '入门', chapter: 'c2', order: 1,
    page: 'pages/mdp.html',
    prereq: '多臂老虎机（理解"试错学习"的动机）',
    takeaway: '学会用五元组 <S,A,P,R,γ> 描述任何决策问题，掌握贝尔曼方程',
    positioning: '老虎机只有动作和奖励 —— 加回"状态"，就得到描述一切 RL 问题的统一框架',
    nextHint: '有了问题的数学描述（MDP），接下来学习如何求解它 → 动态规划',
  },

  // ===== 第三篇 · 经典求解方法 =====
  {
    id: 'dp', icon: '📐', name: '动态规划',
    desc: '策略迭代与价值迭代：已知环境模型时的精确求解',
    tags: ['策略迭代', '价值迭代', '模型已知'],
    level: '入门', chapter: 'c3', order: 1,
    page: 'pages/dp.html',
    prereq: 'MDP（理解贝尔曼方程）',
    takeaway: '理解"评估—改进"循环，知道在环境模型已知时如何精确求最优策略',
    positioning: 'MDP 给了问题描述。如果我们已知完整的环境模型（P、R），就能用 DP 精确求解',
    nextHint: '现实中我们往往不知道转移概率 P → 下一章用 TD 边走边学',
  },
  {
    id: 'td', icon: '🧗', name: '时序差分 (SARSA & Q-Learning)',
    desc: '环境模型未知时：用 TD 误差边走边学',
    tags: ['SARSA', 'Q-Learning', 'TD误差', '模型无关'],
    level: '入门', chapter: 'c3', order: 2,
    page: 'pages/td.html',
    prereq: '动态规划（理解价值函数的迭代式更新）',
    takeaway: '当环境模型未知时，用"TD 误差"边走边学；区分 SARSA/Q-Learning 的性格差异',
    positioning: 'DP 需要完整的环境模型，但现实中我们往往不知道。TD 方法不需要模型，直接从经验采样更新',
    nextHint: '状态太多时表格装不下 → 用神经网络近似 Q 函数 → DQN',
  },
  {
    id: 'dqn', icon: '🧠', name: 'DQN',
    desc: '深度Q网络：经验回放 + 目标网络，让神经网络稳定学习 Q',
    tags: ['神经网络', '经验回放', '目标网络', '深度化'],
    level: '进阶', chapter: 'c3', order: 3,
    page: 'pages/dqn.html',
    prereq: '时序差分（理解 Q-Learning）+ 神经网络基本概念',
    takeaway: '知道把 Q 表换成神经网络会遇到什么问题，以及经验回放/目标网络如何解决它们',
    positioning: 'Q-Learning 用表格存 Q 值，但状态是游戏画面时表格装不下。DQN 用神经网络近似 Q',
    nextHint: 'DQN 只能处理离散动作，且是"间接"优化策略 → 下一篇直接对策略下手',
  },

  // ===== 第四篇 · 策略优化算法进阶 =====
  {
    id: 'reinforce', icon: '🎭', name: 'REINFORCE',
    desc: '最朴素的策略梯度：采样一条轨迹直接优化策略',
    tags: ['策略梯度', '蒙特卡洛', '基础'],
    level: '进阶', chapter: 'c4', order: 1,
    page: 'pages/pg.html',
    prereq: '基本微积分（链式法则），概率分布',
    takeaway: '理解为什么 "∇log π(a|s)·回报" 就是最朴素的策略梯度',
    positioning: '与其先学 Q 再推策略，不如直接优化策略。REINFORCE 是最朴素的策略梯度方法',
    nextHint: 'REINFORCE 方差很大，训练抖动 → 引入 Critic 降低方差 → Actor-Critic',
  },
  {
    id: 'ac', icon: '🎬', name: 'Actor-Critic',
    desc: '演员评论家双网络协作：Critic 降低 Actor 方差',
    tags: ['策略梯度', '优势函数', '双网络'],
    level: '进阶', chapter: 'c4', order: 2,
    page: 'pages/ac.html',
    prereq: 'REINFORCE + 时序差分（TD 误差）',
    takeaway: '理解为什么用 V(s) 做基线能降低方差，以及双网络如何协作',
    positioning: 'REINFORCE 方差太大。Actor-Critic 用 Critic 估计 V(s) 作为基线，大幅降低梯度方差',
    nextHint: 'AC 更新步长不好控制，容易崩溃 → 用 KL 约束保证稳定 → TRPO',
  },
  {
    id: 'trpo', icon: '🛡️', name: 'TRPO',
    desc: '信赖域策略优化：KL 约束保证每步稳定提升',
    tags: ['KL散度', '共轭梯度', '信赖域'],
    level: '进阶', chapter: 'c4', order: 3,
    page: 'pages/trpo.html',
    prereq: 'Actor-Critic + 知道什么是 KL 散度',
    takeaway: '理解为什么要在旧策略"附近"优化，以及 KL 约束带来的稳定性',
    positioning: 'AC 的步长太大容易崩溃。TRPO 强制新旧策略的 KL ≤ δ，画出一个"安全圈"',
    nextHint: 'TRPO 的 KL 约束实现复杂（要共轭梯度、Fisher 矩阵）→ 用裁剪简化 → PPO',
  },
  {
    id: 'ppo', icon: '✂️', name: 'PPO',
    desc: '近端策略优化：用"剪刀"替代复杂约束，工业界事实标准',
    tags: ['Clip', 'GAE', '工业标准'],
    level: '进阶', chapter: 'c4', order: 4,
    page: 'pages/ppo.html',
    prereq: 'TRPO（理解约束的动机）',
    takeaway: '掌握为什么 clip 比 KL 约束更简单好用，为什么 PPO 成了事实标准',
    positioning: 'TRPO 保证稳定但实现复杂。PPO 用一把"剪刀"把概率比裁到 [1-ε, 1+ε]，简单又有效',
    nextHint: 'PPO 还是只处理离散动作 → 连续动作空间（机械臂、油门）怎么办？→ DDPG',
  },
  {
    id: 'ddpg', icon: '🤖', name: 'DDPG',
    desc: '连续动作空间的确定性策略梯度，DQN+Actor-Critic 融合',
    tags: ['连续动作', '软更新', '确定性策略'],
    level: '进阶', chapter: 'c4', order: 5,
    page: 'pages/ddpg.html',
    prereq: 'DQN + Actor-Critic',
    takeaway: '理解确定性策略如何用梯度优化，以及目标网络的"软更新"机制',
    positioning: '前面都是离散动作（左/右/上/下）。机械臂要转多少度？DDPG 把 AC 扩到连续动作空间',
    nextHint: '传统 RL 都需要一个明确的奖励函数 → 人类偏好呢？→ 大模型对齐的 RLHF',
  },

  // ===== 第五篇 · 大语言模型对齐 =====
  {
    id: 'rlhf', icon: '🎯', name: 'RLHF 三阶段',
    desc: 'SFT → RM → PPO：ChatGPT/Claude 背后的经典对齐流水线',
    tags: ['RLHF', 'SFT', 'KL 惩罚', '四模型协同'],
    level: '前沿', chapter: 'c5', order: 1,
    page: 'pages/rlhf.html',
    prereq: 'PPO + 了解大语言模型预训练的基本概念',
    takeaway: '看懂 ChatGPT 对齐的三阶段流水线，理解 π/π_ref/V/RM 四个模型如何协同',
    positioning: '传统 RL 需要明确的奖励函数，但"什么是好回答"没法写代码。RLHF 用人类偏好替代奖励函数',
    nextHint: 'RLHF 的心脏是奖励模型 RM，它到底怎么训练？靠不靠谱？→ 下一章专讲 Reward Model',
  },
  {
    id: 'reward-model', icon: '⚖️', name: 'Reward Model 奖励模型',
    desc: 'Bradley-Terry 偏好建模、RM Hacking、过度优化：对齐算法的心脏',
    tags: ['Pairwise', 'Bradley-Terry', 'RM Hacking'],
    level: '前沿', chapter: 'c5', order: 2,
    page: 'pages/reward-model.html',
    prereq: 'RLHF 三阶段（了解 RM 在整个流水线中的位置）',
    takeaway: '理解偏好数据如何训出打分器，以及 RM 为什么会被"刷分"和如何防范',
    positioning: 'RLHF 的成败 80% 取决于 RM 质量。RM 好比对齐的"心脏"——训不好，后面 PPO 都是白搭',
    nextHint: 'RM 这么麻烦，能不能绕开？→ DPO 直接从偏好数据端到端学习',
  },
  {
    id: 'dpo', icon: '🎁', name: 'DPO 直接偏好优化',
    desc: '跳过 RM 和 PPO，一步到位：从闭式解到简洁的偏好损失',
    tags: ['DPO', '闭式解', '2 模型训练'],
    level: '前沿', chapter: 'c5', order: 3,
    page: 'pages/dpo.html',
    prereq: 'RLHF + Reward Model（理解 RM 和 PPO 的复杂性）',
    takeaway: '掌握 DPO 的漂亮推导：从 RLHF 目标的闭式解代入偏好损失，得到一个监督式损失',
    positioning: 'RLHF 要训 4 个模型，DPO 把三阶段压缩成一阶段，只需 2 个模型',
    nextHint: 'DPO 跳过了在线采样。如果还想保留"在线 RL"的灵活性但又想省掉 Critic？→ GRPO',
  },
  {
    id: 'grpo', icon: '👥', name: 'GRPO 组相对策略优化',
    desc: 'DeepSeek 提出：去掉 Critic，用组内归一化估计优势',
    tags: ['GRPO', '组采样', '无 Critic', 'DeepSeek-R1'],
    level: '前沿', chapter: 'c5', order: 4,
    page: 'pages/grpo.html',
    prereq: 'PPO + RLHF（理解 Critic 在大模型场景下的显存代价）',
    takeaway: '理解为什么在 LLM 场景 Critic 是灾难，以及组采样如何优雅地省掉 Critic',
    positioning: 'PPO 在 LLM 场景要额外训一个 70B 的 Critic，显存会爆炸。GRPO 用组内采样巧妙绕开',
    nextHint: '四种对齐方法各有所长，实战中怎么选？→ 下一章横向对比',
  },
  {
    id: 'align-compare', icon: '📊', name: '四法全景对比',
    desc: 'RLHF/DPO/GRPO 横向对比：稳定性、成本、数据需求、何时选谁',
    tags: ['对比', '决策树', '选型指南'],
    level: '前沿', chapter: 'c5', order: 5,
    page: 'pages/llm.html',
    prereq: '前面 4 个大模型对齐算法',
    takeaway: '学会在实际项目中根据数据、算力、效果要求选择合适的对齐方法',
    positioning: '学完 4 种方法后，在真实项目中怎么选？这里提供一张决策树和一套选型标准',
    nextHint: '🎉 恭喜你走完了整个学习路径！可以回到首页温习，或动手实现一个小项目',
  },
];

// 辅助：按章节分组
export function groupByChapter() {
  const map = new Map();
  for (const ch of CHAPTERS) map.set(ch.id, { chapter: ch, items: [] });
  for (const a of ALGORITHMS) {
    const g = map.get(a.chapter);
    if (g) g.items.push(a);
  }
  // 按 order 排序
  for (const [, g] of map) g.items.sort((a, b) => a.order - b.order);
  return Array.from(map.values());
}

// 辅助：根据算法 id 找到上/下一个算法（按篇章顺序 + 篇内 order）
export function getAdjacentAlgorithms(algoId) {
  const flat = [];
  for (const ch of CHAPTERS) {
    const items = ALGORITHMS.filter(a => a.chapter === ch.id).sort((a, b) => a.order - b.order);
    flat.push(...items);
  }
  const idx = flat.findIndex(a => a.id === algoId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}